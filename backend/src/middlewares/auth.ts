import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.js';

// Extend Express Request to include user
export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
    };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Explicitly check for void return to satisfy TS
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('⚠️ [Auth] No token provided in Authorization header');
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture
        };
        next();
    } catch (error) {
        console.error('❌ [Auth] Token verification error:', error);
        res.status(403).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
};
