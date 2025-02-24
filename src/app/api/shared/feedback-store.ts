// Type definition for the AI response
export interface ResumeRoastResponse {
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