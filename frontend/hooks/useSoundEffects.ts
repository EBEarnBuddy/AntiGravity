"use client";

import useSound from 'use-sound';

// Using free reliable CDN sounds for now, or local if available
const SOUNDS = {
    pop: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Soft pop
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Click
    send: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', // Swoosh
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Achievement
};

export const useSoundEffects = () => {
    const [playPop] = useSound(SOUNDS.pop, { volume: 0.5 });
    const [playClick] = useSound(SOUNDS.click, { volume: 0.3 });
    const [playSend] = useSound(SOUNDS.send, { volume: 0.4 });
    const [playSuccess] = useSound(SOUNDS.success, { volume: 0.5 });

    return {
        playPop,
        playClick,
        playSend,
        playSuccess,
        playJoin: playSuccess
    };
};
