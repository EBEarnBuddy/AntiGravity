import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicationDetails {
    coverLetter?: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
    experience?: string;
    whyInterested?: string;
    availability?: string;
    [key: string]: any;
}

export interface IApplication extends Document {
    opportunity: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
    message?: string; // Short note / cover letter
    roleId?: string; // Which specific role inside a startup/project
    details?: IApplicationDetails; // Structured payload parsed from frontend
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
    {
        opportunity: {
            type: Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
            index: true,
        },
        applicant: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'interviewing'],
            default: 'pending',
        },
        message: { type: String },
        roleId: { type: String },
        details: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

// Prevent duplicate applications per opportunity+applicant pair
ApplicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
