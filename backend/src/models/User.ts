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
    username: { type: String, unique: true, sparse: true, index: true }, // New: sharable handle
    displayName: { type: String },
    photoURL: { type: String },
    bio: { type: String },
    location: { type: String }, // New: Location
    availability: { type: String, enum: ['open', 'busy', 'exploring'], default: 'open' }, // New: Availability
    role: { type: String, default: 'user' }, // e.g. "Full-stack Developer"
    skills: [{ type: String }],
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        portfolio: String
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // New: Followers
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }], // New: Following
    stats: { // New: Execution stats
        opportunitiesPosted: { type: Number, default: 0 },
        opportunitiesJoined: { type: Number, default: 0 },
        circlesParticipated: { type: Number, default: 0 },
        circlesCompleted: { type: Number, default: 0 },
        reputationScore: { type: Number, default: 0 }
    },
    badges: [{ // New: Badges
        name: String,
        icon: String,
        earnedAt: Date
    }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Opportunity' }],
    lastLogin: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
