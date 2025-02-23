import { NextRequest, NextResponse } from 'next/server';
import { lastFeedback } from '../roast/route';

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

// In a real app, this would be stored in a database
let lastFeedback: ResumeRoastResponse | null = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    lastFeedback = body;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to store feedback', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!lastFeedback) {
    return NextResponse.json(
      { error: 'No feedback available' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    feedback: lastFeedback
  });
} 