import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  SleepQuality,
  StressLevel,
  SorenessLevel,
  HydrationLevel,
  NutritionQuality,
  MuscleGroup,
} from '../types';

// ====================================================
// Muscle Soreness Sub-Document
// ====================================================
interface IMuscleSoreness {
  muscle: MuscleGroup;
  level: SorenessLevel;
}

const muscleSorenessSchema = new Schema<IMuscleSoreness>(
  {
    muscle: {
      type: String,
      enum: Object.values(MuscleGroup),
      required: true,
    },
    level: {
      type: Number,
      enum: [0, 1, 2, 3, 4],
      required: true,
    },
  },
  { _id: false }
);

// ====================================================
// Recovery Log Document
// ====================================================
export interface IRecoveryLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  date: Date;
  sleepHours?: number;
  sleepQuality?: SleepQuality;
  stressLevel?: StressLevel;
  overallSoreness?: SorenessLevel;
  muscleSoreness: IMuscleSoreness[];
  hydration?: HydrationLevel;
  nutrition?: NutritionQuality;
  bodyWeight?: number;
  notes?: string;
  recoveryScore?: number; // 0-100 computed
  readinessScore?: number; // 0-100 computed
  createdAt: Date;
  updatedAt: Date;
}

const recoveryLogSchema = new Schema<IRecoveryLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    sleepQuality: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    stressLevel: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    overallSoreness: {
      type: Number,
      enum: [0, 1, 2, 3, 4],
    },
    muscleSoreness: [muscleSorenessSchema],
    hydration: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    nutrition: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    bodyWeight: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    recoveryScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    readinessScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
recoveryLogSchema.index({ user: 1, date: -1 });
recoveryLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Compute recovery and readiness scores before saving
recoveryLogSchema.pre('save', function (next) {
  let score = 0;
  let factors = 0;

  if (this.sleepQuality) {
    score += (this.sleepQuality / 5) * 30; // Sleep is 30% of recovery
    factors++;
  }
  if (this.sleepHours) {
    const sleepScore = Math.min(this.sleepHours / 8, 1) * 20; // 8 hours = max
    score += sleepScore;
    factors++;
  }
  if (this.stressLevel) {
    score += ((6 - this.stressLevel) / 5) * 15; // Inverse - less stress = better
    factors++;
  }
  if (this.overallSoreness !== undefined) {
    score += ((4 - this.overallSoreness) / 4) * 15; // Inverse - less sore = better
    factors++;
  }
  if (this.hydration) {
    score += (this.hydration / 4) * 10;
    factors++;
  }
  if (this.nutrition) {
    score += (this.nutrition / 4) * 10;
    factors++;
  }

  if (factors > 0) {
    this.recoveryScore = Math.round(score);
    this.readinessScore = Math.round(score * 0.9 + 10); // Slight offset for readiness
  }

  next();
});

export default mongoose.model<IRecoveryLog>('RecoveryLog', recoveryLogSchema);
