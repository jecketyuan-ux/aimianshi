export interface Question {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  type: QuestionType;
  tags: string[];
  timeLimit: number;
  points: number;
  hints: string[];
  solution?: Solution;
  testCases?: TestCase[];
  companies: string[];
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Solution {
  explanation: string;
  code: Record<ProgrammingLanguage, string>;
  timeComplexity: string;
  spaceComplexity: string;
  approach: string;
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  description?: string;
}

export interface Interview {
  id: string;
  userId: string;
  type: InterviewType;
  category: Category;
  difficulty: Difficulty;
  questions: Question[];
  duration: number;
  status: InterviewStatus;
  score?: number;
  feedback?: InterviewFeedback;
  transcript?: TranscriptEntry[];
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface InterviewFeedback {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
}

export interface TranscriptEntry {
  timestamp: number;
  speaker: 'interviewer' | 'candidate';
  content: string;
  type: 'speech' | 'code' | 'action';
}

export type Category = 
  | 'algorithms' 
  | 'data-structures' 
  | 'system-design'
  | 'behavioral'
  | 'database'
  | 'web-development'
  | 'mobile-development'
  | 'machine-learning'
  | 'devops'
  | 'networking'
  | 'security';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 
  | 'coding' 
  | 'multiple-choice' 
  | 'short-answer' 
  | 'essay'
  | 'system-design'
  | 'behavioral';

export type InterviewType = 
  | 'technical' 
  | 'behavioral' 
  | 'system-design'
  | 'coding'
  | 'full-stack'
  | 'phone-screen'
  | 'onsite';

export type InterviewStatus = 
  | 'scheduled' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled'
  | 'paused';

export type ProgrammingLanguage = 
  | 'javascript' 
  | 'python' 
  | 'java' 
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'typescript'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin';