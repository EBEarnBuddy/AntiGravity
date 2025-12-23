import { io, Socket } from 'socket.io-client';
import { auth } from './firebase';

let socket: Socket | null = null;

export const getSocket = async () => {
    if (socket) {
        if (!socket.connected) {
            socket.connect();
        }
        return socket;
    }

    if (!auth) return null;
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();

    // Use environment variable for URL if possible, defaulting to localhost:5000
    // Strip /api/v1 suffix to get the root server URL for Socket.io
    let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (rawUrl.endsWith('/api/v1')) {
        rawUrl = rawUrl.replace('/api/v1', '');
    }
    const URL = rawUrl;

    console.log(`🔌 [Socket] Connecting to: ${URL} for UID: ${user.uid}`);

    socket = io(URL, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log(`✅ [Socket] Connected. ID: ${socket?.id}`);
    });

    socket.on('connect_error', (err) => {
        console.error(`❌ [Socket] Connection Error:`, err.message);
    });

    socket.connect();
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
