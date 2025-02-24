"use client"

import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ScoreTooltipProps {
  category: string;
  description: string;
  howToImprove: string;
}

export const tooltipContent: Record<string, ScoreTooltipProps> = {
  // Academic subscores
  gpaPresentation: {
    category: "GPA Presentation",
    description: "How clearly and effectively your GPA is presented on your resume",
    howToImprove: "Include both weighted/unweighted GPA, show upward trends, and highlight academic distinctions"
  },
  courseLoad: {
    category: "Course Load",
    description: "The rigor and relevance of your academic courses",
    howToImprove: "Take challenging courses (AP/IB/Honors) aligned with your interests and career goals"
  },
  awardsHonors: {
    category: "Awards & Honors",
    description: "Academic achievements, recognition, and honors received",
    howToImprove: "Highlight competitive awards, specify the scope (national/regional), and quantify achievements"
  },
  academicProjects: {
    category: "Academic Projects",
    description: "Quality and impact of your academic projects and research",
    howToImprove: "Detail complex projects, highlight innovative solutions, and quantify outcomes"
  },
  testScores: {
    category: "Test Scores",
    description: "Standardized test scores (SAT, ACT, AP, etc.)",
    howToImprove: "Include strong test scores, show improvement over time, and highlight subject-specific achievements"
  },
  classRank: {
    category: "Class Rank",
    description: "Your academic standing relative to your peers",
    howToImprove: "Include if in top percentiles, show improvement over time, and provide context"
  },
  academicGrowth: {
    category: "Academic Growth",
    description: "Demonstrated improvement and progression in academics",
    howToImprove: "Highlight increasing course difficulty, improving grades, and expanding academic interests"
  },
  // Experience subscores
  descriptionQuality: {
    category: "Description Quality",
    description: "How well your experiences are described and presented",
    howToImprove: "Use strong action verbs, be specific about your role, and highlight key achievements"
  },
  impactMetrics: {
    category: "Impact Metrics",
    description: "Quantifiable achievements and measurable results",
    howToImprove: "Include numbers, percentages, and specific metrics to demonstrate impact"
  },
  duration: {
    category: "Duration",
    description: "Length and consistency of your commitments",
    howToImprove: "Show long-term dedication, highlight progressive responsibility, and explain gaps"
  },
  progression: {
    category: "Progression",
    description: "Growth in responsibilities and leadership over time",
    howToImprove: "Show promotions, increased responsibilities, and leadership development"
  },
  relevance: {
    category: "Relevance",
    description: "Alignment of experiences with career goals",
    howToImprove: "Focus on experiences that demonstrate skills relevant to your target field"
  },
  responsibilityLevel: {
    category: "Responsibility Level",
    description: "Leadership roles and level of authority shown",
    howToImprove: "Highlight leadership positions, team management, and decision-making responsibilities"
  },
  initiativeShown: {
    category: "Initiative Shown",
    description: "Demonstrated proactiveness and self-motivation",
    howToImprove: "Highlight self-started projects, improvements implemented, and problems solved"
  },
  // Focus score
  focus: {
    category: "Focus Score",
    description: "How well your activities and experiences align with a clear specialization or 'spike'",
    howToImprove: "Choose activities that build upon each other in your area of interest, demonstrate increasing responsibility and impact in that field, and tell a cohesive story about your passions"
  }
};

export function ScoreTooltip({ scoreKey }: { scoreKey: keyof typeof tooltipContent }) {
  const content = tooltipContent[scoreKey];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 text-main inline-block ml-1 hover:text-main/80 transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <h4 className="font-bold">{content.category}</h4>
            <p className="text-text/80">{content.description}</p>
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium">How to improve:</p>
              <p className="text-text/80 text-xs">{content.howToImprove}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 