import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomMembership extends Document {
    room: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    role: 'member' | 'admin';
    status: 'pending' | 'accepted' | 'rejected';
    joinedAt: Date;
}

const RoomMembershipSchema: Schema = new Schema({
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'accepted' },
    joinedAt: { type: Date, default: Date.now },
}, { timestamps: false }); // No updated at needed really, unless role changes

// Prevent duplicate membership
RoomMembershipSchema.index({ room: 1, user: 1 }, { unique: true });

export default mongoose.model<IRoomMembership>('RoomMembership', RoomMembershipSchema);
