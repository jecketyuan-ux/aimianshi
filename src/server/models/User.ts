import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, UserProfile, UserPreferences, Subscription, ExperienceLevel } from '@/shared/types';

export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userProfileSchema = new Schema<UserProfile>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  experience: { 
    type: String, 
    enum: ['junior', 'mid', 'senior', 'lead', 'principal'],
    default: 'mid'
  },
  targetRoles: [{ type: String }],
  targetCompanies: [{ type: String }],
  resumeUrl: { type: String },
}, { _id: false });

const notificationSettingsSchema = new Schema({
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  interviewReminders: { type: Boolean, default: true },
  progressUpdates: { type: Boolean, default: true },
}, { _id: false });

const interviewSettingsSchema = new Schema({
  defaultDuration: { type: Number, default: 60 },
  defaultDifficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  defaultInterviewType: { 
    type: String, 
    enum: ['technical', 'behavioral', 'system-design', 'coding', 'full-stack'],
    default: 'technical'
  },
  voiceEnabled: { type: Boolean, default: true },
  cameraEnabled: { type: Boolean, default: false },
}, { _id: false });

const userPreferencesSchema = new Schema<UserPreferences>({
  language: { 
    type: String, 
    enum: ['zh-CN', 'en'],
    default: 'zh-CN'
  },
  timezone: { type: String, default: 'Asia/Shanghai' },
  notifications: { type: notificationSettingsSchema, default: () => ({}) },
  interviewSettings: { type: interviewSettingsSchema, default: () => ({}) },
}, { _id: false });

const subscriptionSchema = new Schema<Subscription>({
  plan: { 
    type: String, 
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  features: [{ type: String }],
}, { _id: false });

const userSchema = new Schema<UserDocument>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  profile: { type: userProfileSchema, required: true },
  preferences: { type: userPreferencesSchema, default: () => ({}) },
  subscription: { type: subscriptionSchema, default: () => ({}) },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<UserDocument>('User', userSchema);