import mongoose, { Schema, Document } from 'mongoose';
import { Question as IQuestion, Solution, TestCase, Category, Difficulty, QuestionType, ProgrammingLanguage } from '@/shared/types';

export interface QuestionDocument extends IQuestion, Document {}

const testCaseSchema = new Schema<TestCase>({
  input: { type: Schema.Types.Mixed, required: true },
  expectedOutput: { type: Schema.Types.Mixed, required: true },
  description: { type: String },
}, { _id: false });

const solutionSchema = new Schema<Solution>({
  explanation: { type: String, required: true },
  code: { 
    type: Map, 
    of: String,
    default: new Map()
  },
  timeComplexity: { type: String, required: true },
  spaceComplexity: { type: String, required: true },
  approach: { type: String, required: true },
}, { _id: false });

const questionSchema = new Schema<QuestionDocument>({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 5000
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
  type: { 
    type: String, 
    enum: ['coding', 'multiple-choice', 'short-answer', 'essay', 'system-design', 'behavioral'],
    required: true
  },
  tags: [{ type: String, trim: true }],
  timeLimit: { 
    type: Number, 
    required: true,
    min: 5,
    max: 180
  },
  points: { 
    type: Number, 
    required: true,
    min: 1,
    max: 1000
  },
  hints: [{ type: String, trim: true }],
  solution: { type: solutionSchema },
  testCases: [testCaseSchema],
  companies: [{ type: String, trim: true }],
  frequency: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ companies: 1 });
questionSchema.index({ frequency: -1 });
questionSchema.index({ title: 'text', description: 'text' });

export const Question = mongoose.model<QuestionDocument>('Question', questionSchema);