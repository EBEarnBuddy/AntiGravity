import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Application from '../models/Application.js';
import CollabRequest from '../models/CollabRequest.js';
import CollaborationRequest from '../models/CollaborationRequest.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Opportunity from '../models/Opportunity.js';
import Room from '../models/Room.js';
import RoomMembership from '../models/RoomMembership.js';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function clearDatabase() {
    if (!MONGO_URI) {
        console.error('MONGO_URI not found in environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        console.log('Clearing database...');

        await Application.deleteMany({});
        console.log('Cleared Applications');

        // Handle both potential collab request models
        await CollabRequest.deleteMany({});
        console.log('Cleared CollabRequests');

        await CollaborationRequest.deleteMany({});
        console.log('Cleared CollaborationRequests');

        await Event.deleteMany({});
        console.log('Cleared Events');

        await Message.deleteMany({});
        console.log('Cleared Messages');

        await Notification.deleteMany({});
        console.log('Cleared Notifications');

        await Opportunity.deleteMany({});
        console.log('Cleared Opportunities');

        await Room.deleteMany({});
        console.log('Cleared Rooms');

        await RoomMembership.deleteMany({});
        console.log('Cleared RoomMemberships');

        await User.deleteMany({});
        console.log('Cleared Users');

        console.log('Database cleared successfully.');
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from DB');
    }
}

clearDatabase();
