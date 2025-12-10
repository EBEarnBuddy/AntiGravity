import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Sync User (Create if not exists, otherwise return)
export const syncUser = async (req: AuthRequest, res: Response) => {
    try {
        const { uid, email } = req.user!;
        const { displayName, photoURL } = req.body;

        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email: email || '',
                displayName: displayName || 'New User',
                photoURL: photoURL || '',
            });
            console.log(`Created new user: ${uid}`);
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
};

// Get Current User
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update User Profile
export const updateMe = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const updates = req.body;

        // Prevent updating sensitive fields if any (e.g. firebaseUid)
        delete updates.firebaseUid;
        delete updates.email; // Email should be updated in Firebase

        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            { $set: updates },
            { new: true }
        );

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};
