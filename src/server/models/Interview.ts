import mongoose, { Schema, Document } from 'mongoose';
import { Interview as IInterview, InterviewFeedback, TranscriptEntry, InterviewType, InterviewStatus } from '@/shared/types';

export interface InterviewDocument extends IInterview, Document {}

const transcriptEntrySchema = new Schema<TranscriptEntry>({
  timestamp: { type: Number, required: true },
  speaker: { 
    type: String, 
    enum: ['interviewer', 'candidate'],
    required: true
  },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['speech', 'code', 'action'],
    required: true
  },
}, { _id: false });

const interviewFeedbackSchema = new Schema<InterviewFeedback>({
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  technicalScore: { type: Number, required: true, min: 0, max: 100 },
  communicationScore: { type: Number, required: true, min: 0, max: 100 },
  problemSolvingScore: { type: Number, required: true, min: 0, max: 100 },
  strengths: [{ type: String, trim: true }],
  weaknesses: [{ type: String, trim: true }],
  recommendations: [{ type: String, trim: true }],
  detailedFeedback: { type: String, required: true },
}, { _id: false });

const interviewSchema = new Schema<InterviewDocument>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  type: { 
    type: String, 
    enum: ['technical', 'behavioral', 'system-design', 'coding', 'full-stack', 'phone-screen', 'onsite'],
    required: true
  },
  category: { 
    type: String, 
    enum: [
      'algorithms',
      'data-structures',
      'system-design',
      'behavioral',
      'database',
      'web-development',
      'mobile-development',
      'machine-learning',
      'devops',
      'networking',
      'security'
    ],
    required: true
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  questions: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Question'
  }],
  duration: { 
    type: Number, 
    required: true,
    min: 15,
    max: 240
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'paused'],
    default: 'scheduled'
  },
  score: { type: Number, min: 0, max: 100 },
  feedback: { type: interviewFeedbackSchema },
  transcript: [transcriptEntrySchema],
  recordingUrl: { type: String },
  completedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

interviewSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.duration / 60);
});

interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ type: 1, category: 1 });
interviewSchema.index({ status: 1, createdAt: -1 });

export const Interview = mongoose.model<InterviewDocument>('Interview', interviewSchema);