import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Sync User (Create if not exists, return updated)
export const syncUser = async (req: AuthRequest, res: Response) => {
    try {
        const { uid, email, name, picture } = req.user!;
        // Use body if provided, otherwise fall back to token, then defaults
        const body = req.body || {};
        const displayName = body.displayName || name || 'New User';
        const photoURL = body.photoURL || picture || '';

        console.log(`🔄 [Sync] Attempting sync for UID: ${uid} | Email: ${email}`);

        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            {
                $set: {
                    email, // Always keep email in sync with Auth
                    displayName,
                    photoURL,
                    lastLogin: new Date()
                },
                $setOnInsert: {
                    role: 'user',
                    skills: []
                }
            },
            {
                new: true, // Return the updated document
                upsert: true, // Create if not exists
                setDefaultsOnInsert: true
            }
        );

        console.log(`✅ [Sync] Success for UID: ${uid} | ID: ${user._id}`);
        res.status(200).json(user);
    } catch (error) {
        console.error('❌ [Sync] Failed for UID:', req.user?.uid, error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
};

// Get Current User
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { type } = req.query;
        console.log(`🔥 API HIT: GET /opportunities Type: ${type}`);
        console.log(`[GET /opportunities] Fetching type: ${type}`);
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

// Toggle Bookmark
export const toggleBookmark = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { opportunityId } = req.body;

        if (!opportunityId) {
            res.status(400).json({ error: 'Opportunity ID is required' });
            return;
        }

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Initialize bookmarks array if it doesn't exist
        if (!user.bookmarks) {
            user.bookmarks = [];
        }

        const index = user.bookmarks.findIndex((id: any) => id.toString() === opportunityId);
        let action = '';

        if (index > -1) {
            // Remove bookmark
            user.bookmarks.splice(index, 1);
            action = 'removed';
        } else {
            // Add bookmark
            user.bookmarks.push(opportunityId);
            action = 'added';
        }

        await user.save();

        res.json({
            message: `Bookmark ${action}`,
            bookmarks: user.bookmarks,
            action
        });
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
};
