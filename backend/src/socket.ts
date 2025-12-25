import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { auth } from './config/firebase.js';
import RoomMembership from './models/RoomMembership.js';
import User from './models/User.js';

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // Allow all for dev, tighten for prod
            methods: ['GET', 'POST']
        }
    });

    // Middleware for Auth
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decodedToken = await auth.verifyIdToken(token);
            socket.data.user = decodedToken;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const uid = socket.data.user.uid;
        console.log(`User connected: ${uid}`);

        // Join personal room for notifications
        socket.join(`user_${uid}`);

        socket.on('join_room', async (roomId: string) => {
            try {
                const user = await User.findOne({ firebaseUid: socket.data.user.uid });
                if (!user) return;

                // Verify membership before allowing join
                const isMember = await RoomMembership.exists({ room: roomId, user: user._id });

                if (isMember) {
                    socket.join(roomId);
                    console.log(`User ${user.displayName} joined room ${roomId}`);
                } else {
                    console.warn(`User ${user.displayName} tried to join room ${roomId} without membership`);
                    socket.emit('error', 'Not a member of this room');
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        });

        socket.on('leave_room', (roomId: string) => {
            socket.leave(roomId);
        });

        // Typing Indicators
        socket.on('typing', (data: { roomId: string, userId: string, userName: string }) => {
            // Broadcast to everyone in the room except the sender
            socket.to(data.roomId).emit('typing', data);
        });

        socket.on('stop_typing', (data: { roomId: string, userId: string }) => {
            socket.to(data.roomId).emit('stop_typing', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

// Global IO instance holder to use in controllers
let ioInstance: Server | null = null;

export const setIO = (io: Server) => {
    ioInstance = io;
};

export const getIO = () => {
    if (!ioInstance) {
        throw new Error('Socket.io not initialized!');
    }
    return ioInstance;
};
