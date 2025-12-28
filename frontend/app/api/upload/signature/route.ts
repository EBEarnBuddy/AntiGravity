import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { folder } = body;

        if (!folder) {
            return NextResponse.json({ message: 'Folder is required' }, { status: 400 });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = {
            timestamp,
            folder,
        };

        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

        return NextResponse.json({
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        });
    } catch (error) {
        console.error('Error generating signature:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
