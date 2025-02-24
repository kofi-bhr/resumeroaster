import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { ResumeRoastResponse } from '../shared/feedback-store';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are ResumeRoaster, a brutally honest AI career coach for high school students. Your job is to analyze resumes and provide detailed, actionable feedback following a strict scoring system.

SCORING RULES:
1. Use full 0-100 scale with specific numbers (e.g., 73/100)
2. Score 0 for missing critical sections
3. Score 100 for appropriately missing optional items
4. Grade relative to current grade level expectations
5. Consider coherence of focus vs scattered interests

RESPONSE FORMAT:
You must output ONLY valid JSON matching this exact structure. Do not include any other text or explanation:

{
  "studentInfo": {
    "firstName": "string (extract from resume)",
    "lastName": "string (extract from resume)",
    "schoolName": "string (extract from resume)",
    "graduationYear": "number (extract from resume, e.g. 2025)",
    "gradeLevel": "string (one of: Freshman, Sophomore, Junior, Senior - this is given to you)"
  },
  "roast": "string (a specific, biting headline based on actual resume content)",
  "scores": {
    "academic": {
      "overall": "number (0-100)",
      "subscores": {
        "gpaPresentation": "number (0-100, how well GPA is presented)",
        "courseLoad": "number (0-100, rigor of courses)",
        "awardsHonors": "number (0-100, academic achievements)",
        "academicProjects": "number (0-100, quality of academic projects)",
        "testScores": "number (0-100, standardized test scores if present)",
        "classRank": "number (0-100, class rank if present)",
        "academicGrowth": "number (0-100, improvement over time)"
      }
    },
    "experience": {
      "overall": "number (0-100)",
      "subscores": {
        "descriptionQuality": "number (0-100, how well experiences are described)",
        "impactMetrics": "number (0-100, quantifiable achievements)",
        "duration": "number (0-100, length of commitments)",
        "progression": "number (0-100, growth in responsibilities)",
        "relevance": "number (0-100, alignment with goals)",
        "responsibilityLevel": "number (0-100, leadership shown)",
        "initiativeShown": "number (0-100, proactiveness demonstrated)"
      }
    }
  },
  "focus": {
    "hasSpike": "boolean (true if clear specialization)",
    "score": "number (0-100, coherence of focus)",
    "areas": ["string array of 1-3 main focus areas"]
  },
  "notes": [
    {
      "category": "string (one of: suggestion, fix, problem, issue, advice)",
      "title": "string (short, punchy headline)",
      "description": "string (specific criticism with actionable fix)"
    }
  ]
}

REQUIREMENTS:
1. Every criticism must reference specific examples from the resume
2. Comments should be harsh but actionable
3. All scores must be justified with specific examples
4. Use specific, non-round numbers for authenticity (e.g. 87 not 90)
5. Provide 10-20 detailed notes
6. Every note must reference specific content and include actionable fixes
7. The roast headline must be specific to their resume content and actually sting
8. Extract student info carefully from the resume text
9. Infer grade level from graduation year (2024=Senior, 2025=Junior, etc.)
10. Output ONLY valid JSON - no other text`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-pro-exp-02-05",
  generationConfig: {
    temperature: 0,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File;
    const careerGoals = formData.get('careerGoals') as string;
    const gradeLevel = formData.get('gradeLevel') as string;

    if (!resumeFile || !careerGoals || !gradeLevel) {
      console.error('Missing required fields:', { 
        hasFile: !!resumeFile, 
        hasCareerGoals: !!careerGoals, 
        hasGradeLevel: !!gradeLevel 
      });
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { 
        status: 400 
      });
    }

    // Parse PDF
    try {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      const resumeText = pdfData.text;

      if (!resumeText || resumeText.trim().length === 0) {
        console.error('PDF parsing produced empty text');
        return NextResponse.json({ 
          error: 'Could not extract text from PDF' 
        }, { 
          status: 400 
        });
      }

      console.log('Successfully parsed PDF, text length:', resumeText.length);

      const prompt = `
      Please analyze the following resume for a high school ${gradeLevel} and provide detailed feedback.
      Your response must be valid JSON wrapped in code fences (\`\`\`json).
      Do not include any other text or explanations outside the JSON.
      
      ---START-RESUME---
      ${resumeText}
      ---END-RESUME---
      
      Career Goals (use this to frame your feedback): ${careerGoals}`;

      // Get AI response
      try {
        console.log('Calling Gemini API...');
        const result = await model.generateContent([
          { text: SYSTEM_PROMPT },
          { text: prompt }
        ]);
        
        if (!result || !result.response) {
          console.error('Empty response from Gemini API');
          return NextResponse.json({ 
            error: 'Empty response from AI service' 
          }, { 
            status: 500 
          });
        }

        const response = await result.response;
        const text = response.text();
        
        // Debug logging
        console.log('Raw AI response type:', typeof text);
        console.log('Raw AI response length:', text.length);
        console.log('Raw AI response first 500 chars:', text.substring(0, 500));
        
        // Extract and parse JSON
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        let jsonText = '';
        
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
          console.log('Found JSON within code fences');
        } else {
          // Try to find JSON without code fences
          try {
            JSON.parse(text.trim()); // Test if the entire response is valid JSON
            jsonText = text.trim();
            console.log('Found raw JSON without code fences');
          } catch {
            // If not valid JSON, try to find JSON-like structure
            const possibleJson = text.match(/\{[\s\S]*\}/);
            if (possibleJson) {
              jsonText = possibleJson[0].trim();
              console.log('Found JSON-like structure');
            } else {
              console.error('Could not find valid JSON structure in response');
              console.error('Response content:', text);
              throw new Error('Could not extract valid JSON from AI response');
            }
          }
        }
        
        console.log('Attempting to parse extracted JSON text');
        
        let feedback: ResumeRoastResponse;
        try {
          const parsed = JSON.parse(jsonText);
          
          // Ensure the structure is correct by explicitly constructing the object
          feedback = {
            studentInfo: parsed.studentInfo,
            roast: parsed.roast,
            scores: parsed.scores,
            focus: parsed.focus || parsed.scores?.focus,  // Try both locations
            notes: parsed.notes || parsed.scores?.notes   // Try both locations
          };
        } catch (error) {
          console.error('JSON parse error:', error);
          console.error('Failed JSON text:', jsonText);
          return NextResponse.json({ 
            error: 'Failed to parse AI response as JSON' 
          }, { 
            status: 500 
          });
        }

        // Detailed validation
        const missingFields = [];
        
        if (!feedback.studentInfo) missingFields.push('studentInfo');
        else {
          if (!feedback.studentInfo.firstName) missingFields.push('studentInfo.firstName');
          if (!feedback.studentInfo.lastName) missingFields.push('studentInfo.lastName');
          if (!feedback.studentInfo.schoolName) missingFields.push('studentInfo.schoolName');
          if (!feedback.studentInfo.graduationYear) missingFields.push('studentInfo.graduationYear');
          if (!feedback.studentInfo.gradeLevel) missingFields.push('studentInfo.gradeLevel');
        }
        
        if (!feedback.roast) missingFields.push('roast');
        
        if (!feedback.scores) missingFields.push('scores');
        else {
          if (!feedback.scores.academic) missingFields.push('scores.academic');
          if (!feedback.scores.experience) missingFields.push('scores.experience');
        }
        
        if (!feedback.focus) missingFields.push('focus');
        else {
          if (typeof feedback.focus.hasSpike !== 'boolean') missingFields.push('focus.hasSpike');
          if (typeof feedback.focus.score !== 'number') missingFields.push('focus.score');
          if (!Array.isArray(feedback.focus.areas)) missingFields.push('focus.areas');
        }
        
        if (!Array.isArray(feedback.notes)) missingFields.push('notes');
        else {
          feedback.notes.forEach((note, index) => {
            if (!note.category) missingFields.push(`notes[${index}].category`);
            if (!note.title) missingFields.push(`notes[${index}].title`);
            if (!note.description) missingFields.push(`notes[${index}].description`);
          });
        }
        
        if (missingFields.length > 0) {
          console.error('Missing fields:', missingFields);
          return NextResponse.json({ 
            error: `AI returned incomplete data structure. Missing fields: ${missingFields.join(', ')}` 
          }, { 
            status: 500 
          });
        }

        // Store in localStorage on client side
        return NextResponse.json({ 
          success: true, 
          feedback: {
            studentInfo: feedback.studentInfo,
            roast: feedback.roast,
            scores: feedback.scores,
            focus: feedback.focus,
            notes: feedback.notes
          }
        });

      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        if (geminiError instanceof Error) {
          return NextResponse.json({ 
            error: `AI service error: ${geminiError.message}` 
          }, { 
            status: 500 
          });
        }
        throw geminiError;
      }

    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      return NextResponse.json({ 
        error: 'Failed to process PDF file' 
      }, { 
        status: 400 
      });
    }

  } catch (error) {
    console.error('Unhandled error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to process resume: ${error.message}` 
      }, { 
        status: 500 
      });
    }
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { 
      status: 500 
    });
  }
} 