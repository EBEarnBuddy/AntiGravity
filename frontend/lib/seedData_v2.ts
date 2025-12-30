import { FirestoreService, Gig, Startup } from './firestore';
import { serverTimestamp } from 'firebase/firestore';

// Sample User IDs (We need valid UIDs if possible, or we rely on system/dummy)
// Since this is a seed script, we will use a dummy ID 'seed-admin'
const SEED_USER_ID = 'seed-admin';

const circles = [
    { name: "Tech Founders", description: "A community for tech startup founders.", isPrivate: false, type: 'community', icon: 'rocket' },
    { name: "React Developers", description: "Discussing React, Next.js, and frontend.", isPrivate: false, type: 'community', icon: 'code' },
    { name: "Designers Hub", description: "UI/UX design discussions.", isPrivate: false, type: 'community', icon: 'palette' },
    { name: "Investor Network", description: "Connect with angel investors.", isPrivate: true, type: 'community', icon: 'briefcase' },
    { name: "AI Enthusiasts", description: "Everything AI and ML.", isPrivate: false, type: 'community', icon: 'cpu' },
    { name: "Web3 Builders", description: "Blockchain and decentralized apps.", isPrivate: false, type: 'community', icon: 'zap' },
    { name: "Marketing Pros", description: "Growth hacking and marketing strategies.", isPrivate: false, type: 'community', icon: 'megaphone' },
    { name: "Remote Workers", description: "Tips for working remotely.", isPrivate: false, type: 'community', icon: 'globe' },
    { name: "Student Entrepreneurs", description: "Campus startup community.", isPrivate: false, type: 'community', icon: 'users' },
    { name: "SaaS Founders", description: "Building software as a service.", isPrivate: false, type: 'community', icon: 'server' }
];

export const seedDataV2 = async () => {
    console.log('🌱 Starting Seed V2...');
    const counts = { circles: 0, startups: 0 };

    // 1. Create Circles
    for (const c of circles) {
        try {
            await FirestoreService.createRoom({
                ...c,
                members: [SEED_USER_ID],
                createdBy: SEED_USER_ID,
                createdAt: serverTimestamp() as any,
                lastActivity: serverTimestamp() as any
            } as any);
            counts.circles++;
        } catch (e) { console.error('Failed circle', c.name, e); }
    }

    // 2. Create Startups (which self-create circles)
    for (let i = 1; i <= 10; i++) {
        try {
            const startup: any = {
                name: `Startup ${i}`,
                description: `Innovative startup #${i} solving big problems.`,
                industry: i % 2 === 0 ? 'fintech' : 'ai',
                stage: 'seed',
                location: 'Remote',
                funding: 'Bootstrapped',
                equity: '1-5%',
                requirements: ['Passion', 'Drive'],
                roles: [
                    {
                        id: `role-${i}-1`,
                        title: 'Frontend Dev',
                        description: 'Build UI',
                        type: 'full-time',
                        location: 'remote',
                        applicants: []
                    },
                    {
                        id: `role-${i}-2`,
                        title: 'Backend Dev',
                        description: 'Build API',
                        type: 'part-time',
                        location: 'remote',
                        applicants: []
                    }
                ],
                status: 'active',
                website: 'https://example.com'
            };
            await FirestoreService.createStartup(startup, SEED_USER_ID);
            counts.startups++;
        } catch (e) { console.error('Failed startup', i, e); }
    }

    console.log(`✅ Seed V2 Complete: ${counts.circles} Circles, ${counts.startups} Startups.`);
};
