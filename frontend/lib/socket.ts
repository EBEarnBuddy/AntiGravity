import { io, Socket } from 'socket.io-client';
import { auth } from './firebase';

let socket: Socket | null = null;

export const getSocket = async () => {
    if (socket?.connected) return socket;

    if (!auth) return null;
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();

    // Use environment variable for URL if possible, defaulting to localhost:5000
    const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    socket = io(URL, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false
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
