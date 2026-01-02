import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: string; // Firebase UID
    actor: string; // Firebase UID
    type: 'application_received' | 'application_accepted' | 'application_rejected' | 'new_message' | 'circle_invite' | 'system' | 'collab_request' | 'collab_accepted' | 'collab_rejected';
    title: string;
    message: string; // Short preview
    link?: string; // Where to redirect (e.g., /circles/123)
    isRead: boolean;
    isHidden?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipient: { type: String, required: true, index: true },
    actor: { type: String, required: true },
    type: { type: String, required: true, enum: ['application_received', 'application_accepted', 'application_rejected', 'new_message', 'circle_invite', 'system', 'collab_request', 'collab_accepted', 'collab_rejected'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false }, // Soft delete for "Clear All"
}, { timestamps: true });

// Optimize "Unread Count" query
NotificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
