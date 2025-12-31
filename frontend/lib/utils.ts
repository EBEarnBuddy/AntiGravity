import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string | number | Date | undefined): string {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        return '';
    }
}

export function getDefaultImage(name: string) {
    const encodedName = encodeURIComponent(name || 'Unknown');
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=128&bold=true`;
}
