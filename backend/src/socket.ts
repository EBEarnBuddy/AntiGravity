import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
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

    // Redis Adapter Setup
    if (process.env.REDIS_URL) {
        try {
            console.log('🔌 [Socket] Initializing Redis Adapter...');
            const pubClient = new Redis(process.env.REDIS_URL);
            const subClient = pubClient.duplicate();

            io.adapter(createAdapter(pubClient, subClient));
            console.log('✅ [Socket] Redis Adapter attached successfully');
        } catch (e) {
            console.error('❌ [Socket] Failed to attach Redis adapter:', e);
        }
    } else {
        console.warn('⚠️ [Socket] No REDIS_URL provided. Running in single-instance mode.');
    }

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
        // console.log(`User connected: ${uid}`); // too noisy

        // Join personal room for notifications
        // IMPORTANT: Join generic user room for multi-tab/device sync
        socket.join(`user:${uid}`);
        // Keep old format for backward compat if needed, but standardizing on user:{uid}
        socket.join(`user_${uid}`);

        socket.on('join_room', async (roomId: string) => {
            try {
                const user = await User.findOne({ firebaseUid: uid });
                if (!user) return;

                // Attach details to socket for easy access later
                socket.data.userDetails = {
                    userId: uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                };

                // Verify membership before allowing join
                // Also allow creators
                const roomDoc = await RoomMembership.findOne({ room: roomId, user: user._id });
                // We also need to check if they are the creator if membership doc doesn't exist?
                // For now, let's assume membership doc exists for creators too or strict check. 
                // Previous logic just used exists().
                const isMember = !!roomDoc || (await import('./models/Room.js')).default.exists({ _id: roomId, createdBy: user._id });

                if (isMember) {
                    socket.join(roomId);
                    // console.log(`User ${user.displayName} joined room ${roomId}`);

                    // 1. Emit to room that user is online
                    socket.to(roomId).emit('member:online', socket.data.userDetails);

                    // 2. Fetch all sockets in this room to send current online list to user
                    const sockets = await io.in(roomId).fetchSockets();
                    const onlineUsers = sockets.map(s => s.data.userDetails).filter(u => u); // Filter undefined if any

                    // Deduplicate by userId
                    const uniqueOnlineUsers = Array.from(new Map(onlineUsers.map(item => [item['userId'], item])).values());

                    socket.emit('room_users', uniqueOnlineUsers);
                } else {
                    // console.warn(`User ${user.displayName} tried to join room ${roomId} without membership`);
                    socket.emit('error', 'Not a member of this room');
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        });

        socket.on('leave_room', (roomId: string) => {
            socket.leave(roomId);
            if (socket.data.userDetails) {
                socket.to(roomId).emit('member:offline', { userId: uid });
            }
        });

        // Listen to personal notification events if needed or just handle via rooms
        socket.on('message:read', (data: { roomId: string, userId: string }) => {
            // Handled by controller usually, but if client emits this, we can broadcast to room
            // Ideally, server updates DB then broadcasts. 
            // If client emits to server, server should handle DB update then broadcast.
            // For now, let's allow relay for instant UI update, but backend controller is source of truth.
        });

        // Typing Indicators
        socket.on('typing', (data: { roomId: string, userId: string, userName: string }) => {
            // Broadcast to everyone in the room except the sender
            socket.to(data.roomId).emit('typing', data);
        });

        socket.on('stop_typing', (data: { roomId: string, userId: string }) => {
            socket.to(data.roomId).emit('stop_typing', data);
        });

        socket.on('disconnecting', () => {
            // Notify all rooms this user is in
            for (const roomId of socket.rooms) {
                if (roomId !== socket.id && !roomId.startsWith('user_') && !roomId.startsWith('user:')) {
                    socket.to(roomId).emit('member:offline', { userId: uid });
                }
            }
        });

        socket.on('disconnect', () => {
            // console.log('User disconnected');
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
