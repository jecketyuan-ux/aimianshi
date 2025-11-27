export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  experience: ExperienceLevel;
  targetRoles: string[];
  targetCompanies: string[];
  resumeUrl?: string;
}

export interface UserPreferences {
  language: 'zh-CN' | 'en';
  timezone: string;
  notifications: NotificationSettings;
  interviewSettings: InterviewSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  interviewReminders: boolean;
  progressUpdates: boolean;
}

export interface InterviewSettings {
  defaultDuration: number;
  defaultDifficulty: Difficulty;
  defaultInterviewType: InterviewType;
  voiceEnabled: boolean;
  cameraEnabled: boolean;
}

export interface Subscription {
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  features: string[];
}

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal';