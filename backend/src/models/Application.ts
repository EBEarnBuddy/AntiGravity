import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    opportunity: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    message?: string; // Cover letter or note
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    opportunity: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: { type: String },
}, { timestamps: true });

// Prevent duplicate applications
ApplicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
