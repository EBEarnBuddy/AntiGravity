"use client";

import { useEffect } from 'react';
import axios from 'axios';

const BackendHealthCheck = () => {
    useEffect(() => {
        const checkHealth = async () => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            // Construct health URL by stripping /api/v1 if present, or just use / if that's where it is.
            // Actually backend `app.ts` has health check at root `/` and `/health`.
            // Let's assume API URL is `.../api/v1`. The root server is at `.../`.
            // Let's try to hit the root of the server.

            let rootUrl = baseUrl;
            if (baseUrl.endsWith('/api/v1')) {
                rootUrl = baseUrl.replace('/api/v1', '');
            }

            console.log(`🔄 [Connection] Checking backend health at ${rootUrl}...`);

            try {
                const response = await axios.get(`${rootUrl}/health`);
                if (response.status === 200) {
                    console.log('✅ [Connection] Backend is ONLINE');
                } else {
                    console.warn(`⚠️ [Connection] Backend returned status ${response.status}`);
                }
            } catch (error) {
                console.error('❌ [Connection] Backend is UNREACHABLE / OFFLINE', error);
            }
        };

        checkHealth();
    }, []);

    return null; // This component renders nothing visible
};

export default BackendHealthCheck;
