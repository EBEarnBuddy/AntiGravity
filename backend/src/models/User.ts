import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    bio?: string;
    role?: string; // e.g., 'founder', 'student', 'freelancer'
    skills: string[];
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        portfolio?: string;
    };
    bookmarks?: string[]; // IDs of bookmarked opportunities
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
}

const UserSchema: Schema = new Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    bio: { type: String },
    role: { type: String, default: 'user' },
    skills: [{ type: String }],
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        portfolio: String
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Opportunity' }],
    lastLogin: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
