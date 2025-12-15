import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Opportunity, { IStartupRole } from '../models/Opportunity';
import Room from '../models/Room';
import RoomMembership from '../models/RoomMembership';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function connect() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment');
  }
  await mongoose.connect(MONGO_URI);
}

async function ensureDemoUser() {
  let user = await User.findOne({ email: 'founder@example.com' });
  if (!user) {
    user = await User.create({
      firebaseUid: 'demo-founder-uid',
      email: 'founder@example.com',
      displayName: 'Demo Founder',
      photoURL: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
      role: 'founder',
      skills: ['Product', 'Founding', 'Leadership'],
    });
  }
  return user;
}

function createStartupRoles(): IStartupRole[] {
  return [
    {
      id: 'founding-fe',
      title: 'Founding Frontend Engineer',
      description:
        'Own the EarnBuddy user experience end-to-end, from dashboards to opportunity flows, in close collaboration with design.',
      requirements: ['3+ years React / Next.js', 'Strong product sense', 'Obsessed with UX details'],
      salary: '₹15–25L + meaningful equity',
      equity: '0.5 – 1.5%',
      type: 'full-time',
      location: 'remote',
      applicants: [],
    },
    {
      id: 'community-lead',
      title: 'Community & Circles Lead',
      description:
        'Design and run our circles, events, and community playbook; turn EarnBuddy into the default home for student builders.',
      requirements: ['You love communities', 'Great writing', 'Comfortable hosting events'],
      salary: 'Stipend + performance-based upside',
      equity: '0.1 – 0.3%',
      type: 'part-time',
      location: 'remote',
      applicants: [],
    },
  ];
}

async function seedStartupOpportunities(posterId: mongoose.Types.ObjectId, founderUid: string) {
  const existing = await Opportunity.countDocuments({ type: 'startup' });
  if (existing > 0) return;

  const baseStartup = {
    type: 'startup' as const,
    description:
      'EarnBuddy is building a collaboration-first platform for startups, student builders, and freelancers to ship together.',
    requirements: ['Founder mindset', 'Comfort with ambiguity'],
    location: 'Remote',
    salary: 'Equity / stipend depending on role',
    postedBy: posterId,
    status: 'open' as const,
    applicants: [],
    name: 'EarnBuddy Core Team',
    industry: 'Future of Work',
    stage: 'pre-seed',
    funding: 'Bootstrapped / early',
    equity: 'Variable by role',
    founderId: founderUid,
    founderName: 'Demo Founder',
    founderAvatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
    startupStatus: 'active' as const,
    roles: createStartupRoles(),
    totalApplicants: 0,
    contact: {
      email: 'hello@earnbuddy.test',
      website: 'https://earnbuddy.test',
      linkedin: 'https://www.linkedin.com/company/earnbuddy',
    },
    additionalInfo:
      'These roles are purely for demo and testing. Feel free to apply with any profile to see the flow.',
    website: 'https://earnbuddy.test',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop&crop=faces',
    teamSize: 4,
    matchScore: 92,
    verified: true,
    foundedDate: '2024',
  };

  // Also create an associated Opportunity Circle (Room)
  const room = await Room.create({
    name: 'EarnBuddy Core Team – Opportunity Circle',
    description: 'Private room for accepted collaborators on the EarnBuddy demo startup.',
    createdBy: posterId,
    isPrivate: true,
    membersCount: 1,
  });

  await RoomMembership.create({
    room: room._id,
    user: posterId,
    role: 'admin',
  });

  await Opportunity.create({
    ...baseStartup,
    room: room._id,
  });
}

async function seedProjectOpportunities(posterId: mongoose.Types.ObjectId, founderUid: string) {
  const existing = await Opportunity.countDocuments({ type: 'project' });
  if (existing > 0) return;

  const sampleProjects = [
    {
      title: 'Landing page for climate-tech collective',
      description:
        'Design + build a fast, beautiful landing page for a climate-tech student collective. Focus on storytelling and visuals.',
      requirements: ['Next.js', 'Tailwind', 'Basic SEO'],
      location: 'Remote',
      salary: '$600 – $900 fixed',
    },
    {
      title: 'Pitch deck polish for early-stage fintech',
      description:
        'Help a small fintech startup turn a rough pitch narrative into a crisp, fundable deck. Visual + copy help both welcome.',
      requirements: ['Pitch decks', 'Storytelling', 'Basic design'],
      location: 'Remote',
      salary: '$300 – $500 fixed',
    },
  ];

  for (const project of sampleProjects) {
    const room = await Room.create({
      name: `${project.title} – Opportunity Circle`,
      description: project.description,
      createdBy: posterId,
      isPrivate: true,
      membersCount: 1,
    });

    await RoomMembership.create({
      room: room._id,
      user: posterId,
      role: 'admin',
    });

    await Opportunity.create({
      type: 'project',
      title: project.title,
      description: project.description,
      requirements: project.requirements,
      location: project.location,
      salary: project.salary,
      postedBy: posterId,
      status: 'open',
      applicants: [],
      name: project.title,
      industry: 'Freelance / Colancing',
      stage: 'seed',
      funding: 'Client-funded project',
      equity: '0%',
      founderId: founderUid,
      founderName: 'Demo Founder',
      founderAvatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
      startupStatus: 'active',
      roles: [
        {
          id: 'primary-role',
          title: 'Primary contributor',
          description: project.description,
          requirements: project.requirements,
          salary: project.salary,
          equity: '0%',
          type: 'contract',
          location: 'remote',
          applicants: [],
        },
      ],
      totalApplicants: 0,
      contact: {
        email: 'demo-client@earnbuddy.test',
      },
      room: room._id,
    });
  }
}

async function seedCommunityCircles(posterId: mongoose.Types.ObjectId) {
  const existingPublicRooms = await Room.countDocuments({ isPrivate: false });
  if (existingPublicRooms > 0) return;

  const circles = [
    {
      name: 'Web Dev – Launch Circles',
      description: 'Builders who ship web projects together every month.',
      icon: '💻',
    },
    {
      name: 'Design Pods',
      description: 'Designers helping early-stage founders with brand and product.',
      icon: '🎨',
    },
    {
      name: 'Campus Builders',
      description: 'Student founders and hackers across campuses.',
      icon: '🏫',
    },
  ];

  for (const circle of circles) {
    const room = await Room.create({
      name: circle.name,
      description: circle.description,
      createdBy: posterId,
      icon: circle.icon,
      isPrivate: false,
      membersCount: 1,
    });

    await RoomMembership.create({
      room: room._id,
      user: posterId,
      role: 'admin',
    });
  }
}

async function main() {
  try {
    await connect();
    const demoUser = await ensureDemoUser();

    await seedStartupOpportunities(demoUser._id, demoUser.firebaseUid);
    await seedProjectOpportunities(demoUser._id, demoUser.firebaseUid);
    await seedCommunityCircles(demoUser._id);

    // eslint-disable-next-line no-console
    console.log('✅ Demo data seeding complete');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to seed demo data:', err);
  } finally {
    await mongoose.disconnect();
  }
}

void main();


