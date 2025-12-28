import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    name: string;
    description: string;
    date: Date;
    hostCircles: mongoose.Types.ObjectId[];
    eventCircle: mongoose.Types.ObjectId; // The temporary room for the event
    type: 'online' | 'offline';
    location?: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    createdBy: mongoose.Types.ObjectId;
}

const EventSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    hostCircles: [{ type: Schema.Types.ObjectId, ref: 'Room' }], // Participating Community Circles
    eventCircle: { type: Schema.Types.ObjectId, ref: 'Room' },
    type: { type: String, enum: ['online', 'offline'], default: 'online' },
    location: { type: String },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', EventSchema);
