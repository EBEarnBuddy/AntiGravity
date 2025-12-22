import mongoose, { Schema, Document } from 'mongoose';

/**
 * Opportunity is the unified backing model for:
 * - Startup opportunities (LaunchPad)
 * - Freelance / Colancing projects
 *
 * For startups we intentionally mirror the frontend `Startup` shape from `frontend/lib/firestore.ts`
 * so that the existing UI can consume these documents without any structural changes.
 */

export interface IStartupRoleApplicant {
    user: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
}

export interface IStartupRole {
    id: string; // stable id used by the frontend when applying
    title: string;
    description: string;
    requirements: string[];
    salary?: string;
    equity?: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    location: 'remote' | 'hybrid' | 'onsite';
    applicants: IStartupRoleApplicant[];
}

export interface IOpportunity extends Document {
    // Core discriminator
    type: 'startup' | 'project' | 'freelance'; // 'startup' = LaunchPad, 'project' = Colancing, 'freelance' = Gig

    // Generic / shared fields
    title?: string; // kept for backwards-compatibility, startups mainly use `name`
    description: string;
    requirements: string[];
    location?: string;
    salary?: string;
    postedBy: mongoose.Types.ObjectId;
    status: 'open' | 'closed';
    applicants: mongoose.Types.ObjectId[];

    // Startup-specific fields (mapped from `Startup` in frontend)
    name?: string;
    industry?: string;
    stage?: string;
    funding?: string;
    equity?: string;
    founderId?: string; // Firebase UID of founder (for quick lookups)
    founderName?: string;
    founderAvatar?: string;
    startupStatus?: 'active' | 'paused' | 'closed';
    roles?: IStartupRole[];
    totalApplicants?: number;
    contact?: {
        email?: string;
        website?: string;
        linkedin?: string;
    };
    additionalInfo?: string;
    website?: string;
    logo?: string;
    teamSize?: number;
    matchScore?: number;
    verified?: boolean;
    foundedDate?: string;

    // Freelance / project specific fields (mapped from `Gig` in frontend)
    company?: string;
    projectType?: 'startup' | 'enterprise' | 'agency' | 'nonprofit';
    totalBudget?: string;
    duration?: string;
    remote?: boolean;
    benefits?: string[];
    urgency?: 'low' | 'medium' | 'high';
    featured?: boolean;
    tags?: string[];
    image?: string;

    // Link to the underlying collaboration circle / room (Opportunity Circle)
    room?: mongoose.Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const StartupRoleApplicantSchema = new Schema<IStartupRoleApplicant>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'interviewing'],
        default: 'pending',
    },
});

const StartupRoleSchema = new Schema<IStartupRole>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String, required: true }],
    salary: { type: String },
    equity: { type: String },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        required: true,
    },
    location: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite'],
        required: true,
    },
    applicants: [StartupRoleApplicantSchema],
});

const OpportunitySchema: Schema = new Schema(
    {
        type: { type: String, enum: ['startup', 'project', 'freelance'], required: true },

        title: { type: String }, // optional – legacy / generic
        description: { type: String, required: true },
        requirements: [{ type: String }],
        location: { type: String, default: 'Remote' },
        salary: { type: String },
        postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
        applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],

        // Startup-specific
        name: { type: String },
        industry: { type: String },
        stage: { type: String },
        funding: { type: String },
        equity: { type: String },
        founderId: { type: String },
        founderName: { type: String },
        founderAvatar: { type: String },
        startupStatus: {
            type: String,
            enum: ['active', 'paused', 'closed'],
            default: 'active',
        },
        roles: [StartupRoleSchema],
        totalApplicants: { type: Number, default: 0 },
        contact: {
            email: String,
            website: String,
            linkedin: String,
        },
        additionalInfo: { type: String },
        website: { type: String },
        logo: { type: String },
        teamSize: { type: Number },
        matchScore: { type: Number },
        verified: { type: Boolean, default: false },
        foundedDate: { type: String },

        // Project / freelance-specific
        company: { type: String },
        projectType: { type: String },
        totalBudget: { type: String },
        duration: { type: String },
        remote: { type: Boolean },
        benefits: [{ type: String }],
        urgency: {
            type: String,
            enum: ['low', 'medium', 'high'],
        },
        featured: { type: Boolean, default: false },
        tags: [{ type: String }],

        room: { type: Schema.Types.ObjectId, ref: 'Room' },
    },
    { timestamps: true }
);

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
