import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaborationRequest extends Document {
    fromCircle: mongoose.Types.ObjectId;
    toCircle: mongoose.Types.ObjectId;
    fromOwner: mongoose.Types.ObjectId;
    toOwner: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CollaborationRequestSchema = new Schema<ICollaborationRequest>({
    fromCircle: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    toCircle: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    fromOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: { type: String },
}, {
    timestamps: true
});

// Index for faster queries (deploy new one)
CollaborationRequestSchema.index({ toOwner: 1, status: 1 });
CollaborationRequestSchema.index({ fromOwner: 1, status: 1 });

export default mongoose.model<ICollaborationRequest>('CollaborationRequest', CollaborationRequestSchema);
