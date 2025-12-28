import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Opportunity from '../models/Opportunity.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function check() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const startups = await Opportunity.countDocuments({ type: 'startup' });
    const projects = await Opportunity.countDocuments({ type: 'project' });
    const all = await Opportunity.find({}, 'type status options').limit(5);

    console.log(`Startups: ${startups}`);
    console.log(`Projects: ${projects}`);
    console.log('Sample docs:', all);

    await mongoose.disconnect();
}

check();
