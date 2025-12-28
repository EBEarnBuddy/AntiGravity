import mongoose, { Schema, Document } from 'mongoose';

export interface ICollabRequest extends Document {
    fromCircle: mongoose.Types.ObjectId;
    toCircle: mongoose.Types.ObjectId;
    proposal: string;
    eventName: string; // Proposed name
    eventDate: Date;
    status: 'pending' | 'accepted' | 'rejected';
    initiatedBy: mongoose.Types.ObjectId;
}

const CollabRequestSchema: Schema = new Schema({
    fromCircle: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    toCircle: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    proposal: { type: String, required: true },
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<ICollabRequest>('CollabRequest', CollabRequestSchema);
