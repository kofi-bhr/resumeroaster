import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

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
    "gradeLevel": "string (one of: Freshman, Sophomore, Junior, Senior - infer from graduation year)"
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

// Add interface for the response type
interface ResumeRoastResponse {
  studentInfo: {
    firstName: string;
    lastName: string;
    schoolName: string;
    graduationYear: number;
    gradeLevel: "Freshman" | "Sophomore" | "Junior" | "Senior";
  };
  roast: string;
  scores: {
    academic: {
      overall: number;
      subscores: {
        gpaPresentation: number;
        courseLoad: number;
        awardsHonors: number;
        academicProjects: number;
        testScores: number;
        classRank: number;
        academicGrowth: number;
      };
    };
    experience: {
      overall: number;
      subscores: {
        descriptionQuality: number;
        impactMetrics: number;
        duration: number;
        progression: number;
        relevance: number;
        responsibilityLevel: number;
        initiativeShown: number;
      };
    };
  };
  focus: {
    hasSpike: boolean;
    score: number;
    areas: string[];
  };
  notes: Array<{
    category: "suggestion" | "fix" | "problem" | "issue" | "advice";
    title: string;
    description: string;
  }>;
}

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-pro-exp-02-05",
  generationConfig: {
    temperature: 0.9,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

// In-memory storage (in a real app, this would be a database)
export let lastFeedback: ResumeRoastResponse | null = null;

// Helper function to extract JSON from possible code fence
function extractJSON(text: string): string {
  // Try to find JSON between code fences
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  // If no code fence, try to parse the whole text
  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get('email') as string;
    const resumeFile = formData.get('resume') as File | null;
    const careerGoals = formData.get('careerGoals') as string;

    console.log('Received request with:', { 
      email, 
      hasResumeFile: !!resumeFile,
      careerGoals 
    });

    if (!email || !resumeFile || !careerGoals) {
      console.log('Missing required fields:', { 
        hasEmail: !!email,
        hasResumeFile: !!resumeFile,
        hasCareerGoals: !!careerGoals
      });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }

    let resumeText = '';
    if (resumeFile) {
      try {
        console.log('Starting PDF processing...');
        // Convert File to ArrayBuffer
        const bytes = await resumeFile.arrayBuffer();
        console.log('File converted to ArrayBuffer, size:', bytes.byteLength);
        
        // Convert ArrayBuffer to Buffer using Buffer.from
        const buffer = Buffer.from(new Uint8Array(bytes));
        console.log('ArrayBuffer converted to Buffer, size:', buffer.length);
        
        // Parse PDF with better error handling
        try {
          console.log('Starting PDF parsing...');
          const pdfData = await pdfParse(buffer);
          console.log('PDF parsed successfully');
          resumeText = pdfData.text;
          console.log('Text extracted, length:', resumeText.length);
          
          // Validate that we got some text
          if (!resumeText || resumeText.trim().length === 0) {
            console.log('No text found in PDF');
            return NextResponse.json(
              { error: 'Could not extract text from PDF. The file might be empty or corrupted.' },
              { status: 400 }
            );
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          return NextResponse.json(
            { error: 'Failed to parse PDF file. Please ensure it is a valid PDF document.' },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('Buffer conversion error:', error);
        return NextResponse.json(
          { error: 'Failed to process the uploaded file.' },
          { status: 400 }
        );
      }
    }

    const prompt = `
    Please analyze the following resume for a high school student and provide detailed feedback.
    Your response must be valid JSON wrapped in code fences (\`\`\`json).
    Do not include any other text or explanations outside the JSON.
    
    ---START-RESUME---
    ${resumeText}
    ---END-RESUME---
    
    Career Goals: ${careerGoals}`;

    try {
      console.log('Calling Gemini API...');
      const result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: prompt }
      ]);
      console.log('Received response from Gemini');
      const response = await result.response;
      const text = response.text();
      console.log('Extracted text from response, length:', text.length);
      
      try {
        console.log('Raw response:', text);
        // Extract JSON from possible code fence
        const jsonText = extractJSON(text);
        console.log('Extracted JSON text:', jsonText);
        
        const parsedResponse = JSON.parse(jsonText) as ResumeRoastResponse;
        console.log('Successfully parsed response');
        
        // Store the feedback directly
        lastFeedback = parsedResponse;
        console.log('Stored feedback in memory');

        // Set proper content type and return
        return new NextResponse(JSON.stringify({ 
          success: true, 
          feedback: parsedResponse 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return new NextResponse(JSON.stringify({
          error: 'Failed to parse AI response. The model returned invalid JSON.',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (aiError) {
      console.error('AI Error:', aiError);
      return new NextResponse(JSON.stringify({
        error: 'Failed to generate feedback from AI.',
        details: aiError instanceof Error ? aiError.message : 'Unknown AI error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse(JSON.stringify({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
} 