import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBodyMeasurement extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  date: Date;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulders?: number;
  neck?: number;
  leftArm?: number;
  rightArm?: number;
  leftForearm?: number;
  rightForearm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  bodyFat?: number;
  notes?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const bodyMeasurementSchema = new Schema<IBodyMeasurement>(
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
    weight: { type: Number, min: 0 },
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hips: { type: Number, min: 0 },
    shoulders: { type: Number, min: 0 },
    neck: { type: Number, min: 0 },
    leftArm: { type: Number, min: 0 },
    rightArm: { type: Number, min: 0 },
    leftForearm: { type: Number, min: 0 },
    rightForearm: { type: Number, min: 0 },
    leftThigh: { type: Number, min: 0 },
    rightThigh: { type: Number, min: 0 },
    leftCalf: { type: Number, min: 0 },
    rightCalf: { type: Number, min: 0 },
    bodyFat: { type: Number, min: 0, max: 100 },
    notes: { type: String, maxlength: 1000 },
    photos: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
bodyMeasurementSchema.index({ user: 1, date: -1 });

export default mongoose.model<IBodyMeasurement>('BodyMeasurement', bodyMeasurementSchema);
