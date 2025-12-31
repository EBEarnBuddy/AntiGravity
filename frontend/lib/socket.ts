import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const socket = io(URL, {
    autoConnect: false,
    reconnection: true,
    transports: ['websocket', 'polling']
});
