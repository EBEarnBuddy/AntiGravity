import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    name: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    icon?: string;
    isPrivate: boolean;
    membersCount: number;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    icon: { type: String }, // URL or icon name
    isPrivate: { type: Boolean, default: false },
    membersCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IRoom>('Room', RoomSchema);
