import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (it will read from process.env if variables are named correctly, 
// but explicit config is safer if the variables have different names)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const getUploadSignature = async (req: Request, res: Response) => {
    try {
        const { folder } = req.body;

        if (!folder) {
            return res.status(400).json({ message: 'Folder is required' });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);

        // Parameters to sign
        const paramsToSign = {
            timestamp,
            folder,
        };

        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

        res.json({
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        });

    } catch (error) {
        console.error('Error generating signature:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
