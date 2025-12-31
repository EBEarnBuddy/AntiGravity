import { useState, useEffect } from 'react';
import api from '../lib/api';

export interface RoomMember {
    _id: string;
    uid: string; // Firebase UID
    username: string;
    displayName: string;
    photoURL?: string;
    role: 'admin' | 'member';
}

export const useRoomMembers = (roomId: string) => {
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const fetchMembers = async () => {
            try {
                const response = await api.get(`/rooms/${roomId}/members`);
                setMembers(response.data);
            } catch (err) {
                console.error("Failed to fetch room members:", err);
                setError('Failed to load members');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [roomId]);

    return { members, loading, error };
};
