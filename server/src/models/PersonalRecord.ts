import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPersonalRecord extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  exercise: Types.ObjectId;
  type: 'weight' | 'volume' | 'reps' | 'duration';
  value: number;
  weight?: number;
  reps?: number;
  date: Date;
  workoutId: Types.ObjectId;
  previousRecord?: number;
  improvement?: number; // percentage improvement
  createdAt: Date;
  updatedAt: Date;
}

const personalRecordSchema = new Schema<IPersonalRecord>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exercise: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    type: {
      type: String,
      enum: ['weight', 'volume', 'reps', 'duration'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: { type: Number, min: 0 },
    reps: { type: Number, min: 0 },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    workoutId: {
      type: Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    },
    previousRecord: { type: Number, min: 0 },
    improvement: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Indexes
personalRecordSchema.index({ user: 1, exercise: 1, type: 1 });
personalRecordSchema.index({ user: 1, date: -1 });
personalRecordSchema.index({ user: 1, type: 1, value: -1 });

export default mongoose.model<IPersonalRecord>('PersonalRecord', personalRecordSchema);
