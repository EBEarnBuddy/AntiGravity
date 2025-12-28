interface CloudinaryResponse {
    secure_url: string;
    [key: string]: any;
}

export const uploadImage = async (file: File, folder: string): Promise<string> => {
    try {
        // 1. Get signature from Next.js API route
        const signatureResponse = await fetch('/api/upload/signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder }),
        });

        if (!signatureResponse.ok) {
            throw new Error('Failed to get upload signature');
        }

        const { signature, timestamp, apiKey, cloudName } = await signatureResponse.json();

        // 2. Prepare upload payload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        // 3. Upload to Cloudinary
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(error.error?.message || 'Failed to upload image');
        }

        const result: CloudinaryResponse = await uploadResponse.json();
        return result.secure_url;

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};
