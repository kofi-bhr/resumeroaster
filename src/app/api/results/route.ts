import { NextRequest, NextResponse } from 'next/server';
import { lastFeedback } from '../roast/route';

// In a real app, this would be stored in a database
let lastFeedback: any = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    lastFeedback = body;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to store feedback' },
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