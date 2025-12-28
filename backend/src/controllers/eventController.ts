import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import Event from '../models/Event.js';

export const getEvents = async (req: Request, res: Response) => {
    try {
        const { status, limit } = req.query;
        const filter: any = {};
        if (status) filter.status = status;

        let query = Event.find(filter).sort({ date: 1 }); // Sort by upcoming date

        if (limit) {
            query = query.limit(Number(limit));
        }

        const events = await query.populate('hostCircles', 'name icon');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const event = await Event.create({
            ...req.body,
            createdBy: req.user?.uid
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
};
