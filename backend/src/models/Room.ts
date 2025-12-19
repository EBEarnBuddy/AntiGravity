import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    name: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    icon?: string;
    type: 'community' | 'opportunity';
    isPrivate: boolean;
    isTemporary?: boolean;
    hasWhiteboard?: boolean;
    hasVideoCall?: boolean;
    membersCount: number;
    lastMessageAt?: Date;
    collaborators?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPrivate: { type: Boolean, default: false },
    avatar: { type: String },
    hasWhiteboard: { type: Boolean, default: false },
    hasVideoCall: { type: Boolean, default: false },
    membersCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
    type: {
        type: String,
        enum: ['community', 'collab', 'opportunity'],
        default: 'community'
    },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }], // For collab circles
}, {
    timestamps: true
});

export default mongoose.model<IRoom>('Room', RoomSchema);
