'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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

const CircularProgress = ({ value }: { value: number }) => {
  const circumference = 2 * Math.PI * 75;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="transform -rotate-90 w-64 h-64">
        <circle
          className="text-muted stroke-current"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r="75"
          cx="128"
          cy="128"
        />
        <circle
          className="text-main stroke-current"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="75"
          cx="128"
          cy="128"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="text-6xl font-bold text-text">{value}</span>
        <span className="block text-2xl font-bold text-main mt-1">
          {getLetterGrade(value)}
        </span>
      </div>
    </div>
  );
};

const getLetterGrade = (score: number): string => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
};

const simplifyCategory = (key: string): string => {
  const simplifications: Record<string, string> = {
    gpaPresentation: 'GPA',
    courseLoad: 'Courses',
    awardsHonors: 'Awards',
    academicProjects: 'Projects',
    testScores: 'Tests',
    classRank: 'Rank',
    academicGrowth: 'Growth',
    descriptionQuality: 'Description',
    impactMetrics: 'Impact',
    responsibilityLevel: 'Responsibility',
    initiativeShown: 'Initiative',
    duration: 'Duration',
    progression: 'Progression',
    relevance: 'Relevance',
  };
  return simplifications[key] || key;
};

export default function Results() {
  const [feedback, setFeedback] = useState<ResumeRoastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryInterval = 500; // 500ms between retries

    const tryLoadFeedback = () => {
      try {
        // Try to get feedback from localStorage
        const storedFeedback = localStorage.getItem('resumeRoastFeedback');
        if (!storedFeedback) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryLoadFeedback, retryInterval);
            return;
          }
          throw new Error('No feedback found. Please submit your resume first.');
        }

        const parsedFeedback = JSON.parse(storedFeedback) as ResumeRoastResponse;
        setFeedback(parsedFeedback);
      } catch (err) {
        console.error('Error loading feedback:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feedback');
        // Redirect back to home after a delay if there's no feedback
        setTimeout(() => router.push('/'), 2000);
      }
    };

    tryLoadFeedback();
  }, [router]);

  // Only clear localStorage after successful render
  useEffect(() => {
    if (feedback) {
      localStorage.removeItem('resumeRoastFeedback');
    }
  }, [feedback]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Error</h2>
          <p className="text-foreground/80">{error}</p>
          <p className="text-foreground/60 mt-2">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const overallScore = Math.round((feedback.scores.academic.overall + feedback.scores.experience.overall) / 2);

  return (
    <main className="min-h-screen bg-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
        >
          {/* Student Info & Score Panel */}
          <Card className="p-6 col-span-1 bg-white border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col items-center">
              {/* Title and score */}
              <div className="w-full text-center">
                <h2 className="text-2xl font-bold text-text mb-1 font-display">Overall Score</h2>
                <div className="-mt-2 mb-2">
                  <CircularProgress value={overallScore} />
                </div>
              </div>

              <div className="text-center -mt-6 mb-8">
                <h1 className="text-2xl font-bold text-text font-display">{feedback.studentInfo.firstName} {feedback.studentInfo.lastName}</h1>
                <p className="text-text/80">{feedback.studentInfo.schoolName}</p>
                <p className="text-text/80">Class of {feedback.studentInfo.graduationYear}</p>
                <p className="text-text/80">{feedback.studentInfo.gradeLevel}</p>
              </div>

              <div className="w-full space-y-3">
                {/* Academic scores section */}
                <div className="space-y-2 border-2 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text font-display">Academic</span>
                    <span className="text-sm font-bold text-text">{feedback.scores.academic.overall}%</span>
                  </div>
                  <Progress value={feedback.scores.academic.overall} className="h-2" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    {Object.entries(feedback.scores.academic.subscores).map(([key, value]) => (
                      <div key={key} className="text-sm border-b border-border/50 pb-1">
                        <span className="text-text/80">{simplifyCategory(key)}</span>
                        <span className="float-right font-medium text-text">{value === 100 || value === 0 ? 'N/A' : `${value}%`}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Experience scores section */}
                <div className="space-y-2 border-2 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text font-display">Experience</span>
                    <span className="text-sm font-bold text-text">{feedback.scores.experience.overall}%</span>
                  </div>
                  <Progress value={feedback.scores.experience.overall} className="h-2" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    {Object.entries(feedback.scores.experience.subscores).map(([key, value]) => (
                      <div key={key} className="text-sm border-b border-border/50 pb-1">
                        <span className="text-text/80">{simplifyCategory(key)}</span>
                        <span className="float-right font-medium text-text">{value === 100 || value === 0 ? 'N/A' : `${value}%`}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Focus scores section */}
                <div className="space-y-2 border-2 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text font-display">Focus</span>
                    <span className="text-sm font-bold text-text">{feedback.focus.score}%</span>
                  </div>
                  <Progress value={feedback.focus.score} className="h-2" />
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Feedback */}
          <Card className="col-span-1 md:col-span-2 bg-white border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-text mb-4 font-display">The Roast 🔥</h2>
                <p className="text-xl font-semibold text-text italic">{feedback.roast}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text mb-4 font-display">Focus Areas</h2>
                <div className="flex gap-2 flex-wrap mb-4">
                  {feedback.focus.areas.map((area) => (
                    <Badge key={area} variant="default">{area}</Badge>
                  ))}
                </div>
                <p className="text-text/80">
                  {feedback.focus.hasSpike 
                    ? "You have a clear focus in your activities and experiences." 
                    : "Your interests and activities are a bit scattered. Consider developing a stronger focus."}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text mb-4 font-display">Notes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedback.notes.map((note, index) => (
                    <Card key={index} className="p-4 bg-white border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Badge variant="default" className="mb-2">{note.category}</Badge>
                      <h3 className="text-lg font-bold text-text mb-2 font-display">{note.title}</h3>
                      <p className="text-text/80">{note.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
} 