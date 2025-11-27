export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CodeExecutionRequest {
  language: ProgrammingLanguage;
  code: string;
  input?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface CodeExecutionResponse {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  exitCode: number;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  interviewId?: string;
}

export interface InterviewStats {
  overview: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    highestScore: number;
    totalDuration: number;
  };
  byType: Array<{
    _id: InterviewType;
    count: number;
    averageScore: number;
  }>;
  byDifficulty: Array<{
    _id: Difficulty;
    count: number;
    averageScore: number;
  }>;
}

export interface CreateInterviewRequest {
  type: InterviewType;
  category: Category;
  difficulty: Difficulty;
  duration: number;
  questionCount?: number;
}

export interface CompleteInterviewRequest {
  transcript?: TranscriptEntry[];
  finalAnswers?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  type: 'text' | 'code' | 'system';
  timestamp: number;
  sender: 'user' | 'ai' | 'system';
}

export interface CodeChange {
  userId: string;
  code: string;
  language: ProgrammingLanguage;
  timestamp: number;
}

export interface InterviewEvent {
  userId: string;
  event: string;
  payload: any;
  timestamp: number;
}

export interface SearchFilters {
  category?: Category;
  difficulty?: Difficulty;
  type?: QuestionType;
  tags?: string[];
  companies?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

import { ProgrammingLanguage } from './interview';
import { InterviewType, Category, Difficulty, TranscriptEntry } from './interview';