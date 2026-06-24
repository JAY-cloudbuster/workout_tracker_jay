import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserRole,
  Gender,
  ExperienceLevel,
  PrimaryGoal,
  TrainingStyle,
  SplitType,
  ActivityLevel,
  UnitSystem,
  Theme,
} from '../types';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  units: UnitSystem;
  trainingAge?: number;
  experienceLevel?: ExperienceLevel;
  primaryGoal?: PrimaryGoal;
  trainingStyle?: TrainingStyle;
  preferredSplit?: SplitType;
  activityLevel?: ActivityLevel;
  timezone?: string;
  theme: Theme;
  favoriteExercises: Types.ObjectId[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: string[];
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    avatar: String,
    age: {
      type: Number,
      min: [13, 'Must be at least 13 years old'],
      max: [120, 'Invalid age'],
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    height: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    units: {
      type: String,
      enum: Object.values(UnitSystem),
      default: UnitSystem.METRIC,
    },
    trainingAge: {
      type: Number,
      min: 0,
    },
    experienceLevel: {
      type: String,
      enum: Object.values(ExperienceLevel),
    },
    primaryGoal: {
      type: String,
      enum: Object.values(PrimaryGoal),
    },
    trainingStyle: {
      type: String,
      enum: Object.values(TrainingStyle),
    },
    preferredSplit: {
      type: String,
      enum: Object.values(SplitType),
    },
    activityLevel: {
      type: String,
      enum: Object.values(ActivityLevel),
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    theme: {
      type: String,
      enum: Object.values(Theme),
      default: Theme.DARK,
    },
    favoriteExercises: [{
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
    }],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [String],
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        delete r.password;
        delete r.refreshTokens;
        delete r.emailVerificationToken;
        delete r.emailVerificationExpires;
        delete r.passwordResetToken;
        delete r.passwordResetExpires;
        delete r.__v;
        return r;
      },
    },
  }
);

// Indexes
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
