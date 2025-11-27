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

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  interviewId?: string;
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

export interface VoiceRecognitionRequest {
  audioData: Blob;
  language: string;
  format: string;
}

export interface VoiceRecognitionResponse {
  transcript: string;
  confidence: number;
  alternatives?: string[];
}

export interface TextToSpeechRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
}

export interface TextToSpeechResponse {
  audioData: Blob;
  duration: number;
}

export interface AIRequest {
  prompt: string;
  context?: any;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface Analytics {
  userId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  category?: Category;
  difficulty?: Difficulty;
  type?: QuestionType;
  companies?: string[];
  tags?: string[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  interviewsCompleted: number;
  averageScore: number;
  streak: number;
}