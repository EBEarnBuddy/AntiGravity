import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
    type: 'startup' | 'project' | 'freelance'; // 'startup' = Job/Co-founder, 'project' = Colancing, 'freelance' = Gig
    title: string;
    description: string;
    requirements: string[]; // e.g. ["React", "Node.js"]
    location?: string; // "Remote", "NYC", etc.
    salary?: string; // "Equity", "$50/hr", "Unpaid"
    postedBy: mongoose.Types.ObjectId; // Reference to User (the poster)
    status: 'open' | 'closed';
    applicants: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const OpportunitySchema: Schema = new Schema({
    type: { type: String, enum: ['startup', 'project', 'freelance'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    location: { type: String, default: 'Remote' },
    salary: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
