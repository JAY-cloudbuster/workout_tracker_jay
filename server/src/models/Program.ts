import mongoose, { Document, Schema, Types } from 'mongoose';
import { ProgressionScheme, PeriodizationType, SplitType } from '../types';

// ====================================================
// Program Exercise Template
// ====================================================
export interface IProgramExercise {
  exercise: Types.ObjectId;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  rpe?: number;
  rir?: number;
  tempo?: string;
  restTime?: number;
  notes?: string;
  supersetGroup?: number;
  progressionScheme: ProgressionScheme;
  progressionIncrement?: number; // weight increment per session
}

const programExerciseSchema = new Schema<IProgramExercise>(
  {
    exercise: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    order: { type: Number, required: true, min: 1 },
    sets: { type: Number, required: true, min: 1, max: 20 },
    repsMin: { type: Number, required: true, min: 1 },
    repsMax: { type: Number, required: true, min: 1 },
    rpe: { type: Number, min: 1, max: 10 },
    rir: { type: Number, min: 0, max: 10 },
    tempo: String,
    restTime: { type: Number, min: 0 },
    notes: { type: String, maxlength: 500 },
    supersetGroup: { type: Number, min: 1 },
    progressionScheme: {
      type: String,
      enum: Object.values(ProgressionScheme),
      default: ProgressionScheme.LINEAR,
    },
    progressionIncrement: { type: Number, min: 0 },
  },
  { _id: true }
);

// ====================================================
// Program Day Template
// ====================================================
export interface IProgramDay {
  name: string;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  split: SplitType;
  exercises: IProgramExercise[];
  notes?: string;
  isRestDay: boolean;
}

const programDaySchema = new Schema<IProgramDay>(
  {
    name: { type: String, required: true, trim: true },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    split: {
      type: String,
      enum: Object.values(SplitType),
    },
    exercises: [programExerciseSchema],
    notes: { type: String, maxlength: 1000 },
    isRestDay: { type: Boolean, default: false },
  },
  { _id: true }
);

// ====================================================
// Microcycle (Week Template)
// ====================================================
export interface IMicrocycle {
  weekNumber: number;
  name: string;
  days: IProgramDay[];
  isDeload: boolean;
  volumeMultiplier: number; // 1.0 = normal, 0.5 = deload
  intensityMultiplier: number;
  notes?: string;
}

const microcycleSchema = new Schema<IMicrocycle>(
  {
    weekNumber: { type: Number, required: true, min: 1 },
    name: { type: String, required: true, trim: true },
    days: [programDaySchema],
    isDeload: { type: Boolean, default: false },
    volumeMultiplier: { type: Number, default: 1.0, min: 0.1, max: 2.0 },
    intensityMultiplier: { type: Number, default: 1.0, min: 0.1, max: 2.0 },
    notes: { type: String, maxlength: 1000 },
  },
  { _id: true }
);

// ====================================================
// Mesocycle
// ====================================================
export interface IMesocycle {
  name: string;
  order: number;
  weeks: number;
  microcycles: IMicrocycle[];
  periodizationType: PeriodizationType;
  deloadFrequency: number; // every N weeks
  autoDeload: boolean;
  notes?: string;
}

const mesocycleSchema = new Schema<IMesocycle>(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    weeks: { type: Number, required: true, min: 1, max: 16 },
    microcycles: [microcycleSchema],
    periodizationType: {
      type: String,
      enum: Object.values(PeriodizationType),
      default: PeriodizationType.LINEAR,
    },
    deloadFrequency: { type: Number, default: 4, min: 2, max: 8 },
    autoDeload: { type: Boolean, default: true },
    notes: { type: String, maxlength: 1000 },
  },
  { _id: true }
);

// ====================================================
// Program Document
// ====================================================
export interface IProgram extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  description?: string;
  trainingStyle: string;
  split: SplitType;
  daysPerWeek: number;
  mesocycles: IMesocycle[];
  isActive: boolean;
  isPublic: boolean;
  startDate?: Date;
  endDate?: Date;
  currentWeek: number;
  currentDay: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
      maxlength: [100, 'Program name must be at most 100 characters'],
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    trainingStyle: {
      type: String,
      required: true,
    },
    split: {
      type: String,
      enum: Object.values(SplitType),
      required: true,
    },
    daysPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    mesocycles: [mesocycleSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    startDate: Date,
    endDate: Date,
    currentWeek: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentDay: {
      type: Number,
      default: 1,
      min: 1,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
programSchema.index({ user: 1, isActive: 1 });
programSchema.index({ user: 1, createdAt: -1 });
programSchema.index({ isPublic: 1 });

export default mongoose.model<IProgram>('Program', programSchema);
