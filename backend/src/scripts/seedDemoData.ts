import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Opportunity, { IStartupRole } from '../models/Opportunity.js';
import Room from '../models/Room.js';
import RoomMembership from '../models/RoomMembership.js';
import Event from '../models/Event.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function connect() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment');
  }
  await mongoose.connect(MONGO_URI);
}

// --- Helper Data ---

const industries = [
  'FinTech', 'HealthTech', 'EdTech', 'Climate Tech', 'AI/ML', 'E-commerce', 'SaaS', 'Web3', 'Consumer Social', 'Gaming'
];

const stages = ['Pre-seed', 'Seed', 'Series A', 'Bootstrapped'];

const locations = ['Remote', 'San Francisco', 'New York', 'London', 'Berlin', 'Bengaluru', 'Singapore', 'Toronto'];

const roles = [
  'Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'Product Designer', 'Product Manager', 'Growth Marketer', 'Content Creator', 'Data Scientist'
];

const projectTitles = [
  'Landing page design & build', 'Mobile app MVP', 'SaaS dashboard redesign', 'Content writing for blog', 'Logo & Brand Identity', 'Smart contract audit', 'Data visualization dashboard', 'SEO optimization'
];

// --- Generators ---

function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStartupRoles(): IStartupRole[] {
  const numRoles = Math.floor(Math.random() * 3) + 1;
  const startupRoles: IStartupRole[] = [];
  for (let i = 0; i < numRoles; i++) {
    const roleTitle = getRandom(roles);
    startupRoles.push({
      id: `role-${Math.random().toString(36).substr(2, 9)}`,
      title: `${Math.random() > 0.7 ? 'Founding ' : ''}${roleTitle}`,
      description: `We are looking for a talented ${roleTitle} to join our early team and help us build the future of our industry.`,
      requirements: ['Experience with modern tech stack', 'Passion for building', 'Ownership mindset'],
      salary: `₹${15 + Math.floor(Math.random() * 20)}L – ₹${35 + Math.floor(Math.random() * 20)}L`,
      equity: `${0.1 + Math.random()}% – ${0.5 + Math.random()}%`,
      type: Math.random() > 0.8 ? 'part-time' : 'full-time',
      location: getRandom(['remote', 'hybrid', 'onsite']),
      applicants: [],
    });
  }
  return startupRoles;
}

// --- Seeding Functions ---

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

async function seedStartups(posterId: mongoose.Types.ObjectId, founderUid: string) {
  const count = await Opportunity.countDocuments({ type: 'startup' });
  if (count >= 15) return;

  const startupNames = [
    'Nebula AI', 'GreenLeaf', 'FinFlow', 'EduVerse', 'BlockChainX', 'MediCare+', 'UrbanSpace', 'FoodieTech', 'StreamLine', 'CyberGuard', 'RocketLaunch', 'CodeWhiz'
  ];

  for (const name of startupNames) {
    // Check if already exists to avoid dupes on re-run
    const exists = await Opportunity.findOne({ name, type: 'startup' });
    if (exists) continue;

    const industry = getRandom(industries);

    const startup = {
      type: 'startup' as const,
      description: `${name} is revolutionizing ${industry} by leveraging cutting-edge technology to solve real-world problems.`,
      requirements: ['Passion', 'Grit', 'Innovation'],
      location: getRandom(locations),
      salary: 'Competitive + Equity',
      postedBy: posterId,
      status: 'open' as const,
      applicants: [],
      name: name,
      industry: industry,
      stage: getRandom(stages),
      funding: getRandom(['Bootstrapped', '$500k Pre-seed', '$2M Seed', '$5M Series A']),
      equity: '1.0% - 5.0%',
      founderId: founderUid,
      founderName: 'Demo Founder',
      founderAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
      startupStatus: 'active' as const,
      roles: generateStartupRoles(),
      totalApplicants: Math.floor(Math.random() * 50),
      contact: {
        email: `hello@${name.toLowerCase().replace(/\s/g, '')}.test`,
        website: `https://${name.toLowerCase().replace(/\s/g, '')}.test`,
      },
      additionalInfo: 'Exciting times ahead!',
      website: `https://${name.toLowerCase().replace(/\s/g, '')}.test`,
      logo: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff&size=128`,
      teamSize: Math.floor(Math.random() * 20) + 2,
      matchScore: Math.floor(Math.random() * 20) + 80, // High match for demo
      verified: Math.random() > 0.3,
      foundedDate: '2023',
    };

    // Associated Circle
    const room = await Room.create({
      name: `${name} – Team Circle`,
      description: `Private circle for ${name} team members.`,
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
      ...startup,
      room: room._id,
    });
  }
}

async function seedProjects(posterId: mongoose.Types.ObjectId, founderUid: string) {
  const count = await Opportunity.countDocuments({ type: 'project' });
  if (count >= 15) return;

  for (const title of projectTitles) {
    const exists = await Opportunity.findOne({ title, type: 'project' });
    if (exists) continue;

    const budget = `$${Math.floor(Math.random() * 5) + 1}k`;

    const project = {
      type: 'project' as const,
      title: title,
      description: `Looking for an expert to help with ${title}. Must have proven experience and a portfolio.`,
      requirements: ['Portfolio', 'Communication', 'Speed'],
      location: 'Remote',
      salary: `${budget} Fixed`,
      postedBy: posterId,
      status: 'open' as const,
      applicants: [],
      name: title, // Backend requires 'name'
      industry: getRandom(industries),
      stage: 'Project',
      funding: 'Funded',
      equity: '0%',
      founderId: founderUid,
      founderName: 'Demo Founder',
      founderAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
      startupStatus: 'active' as const,
      roles: [{
        id: 'primary',
        title: 'Freelancer',
        description: 'Complete the project deliverables.',
        requirements: ['Skill 1', 'Skill 2'],
        salary: budget,
        type: 'contract' as const,
        location: 'remote' as const
      }],
      totalApplicants: Math.floor(Math.random() * 10),
      contact: {
        email: 'client@example.com',
      },
    };

    const room = await Room.create({
      name: `${title.substring(0, 20)}... – Project`,
      description: `Collaboration room for ${title}`,
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
      ...project,
      room: room._id,
    });
  }
}

async function ensureSystemUser() {
  let user = await User.findOne({ email: 'system@earnbuddy.io' });
  if (!user) {
    user = await User.create({
      firebaseUid: 'system-admin-uid',
      email: 'system@earnbuddy.io',
      displayName: 'EarnBuddy System',
      photoURL: 'https://ui-avatars.com/api/?name=EB&background=0f172a&color=fff',
      role: 'admin'
    });
  }
  return user;
}

async function seedCircles(demoUserId: mongoose.Types.ObjectId, systemUserId: mongoose.Types.ObjectId) {
  const categories = [
    { name: 'Web Dev Wizards', icon: '💻', desc: 'Discuss latest frameworks and tools.', owner: 'demo' },
    { name: 'UI/UX Designers', icon: '🎨', desc: 'Feedback, critiques, and design talk.', owner: 'system' },
    { name: 'Indie Hackers', icon: '🚀', desc: 'Building profitable side projects.', owner: 'demo' },
    { name: 'AI Researchers', icon: '🤖', desc: 'Discussing LLMs, agents, and more.', owner: 'system' },
    { name: 'Content Creators', icon: '✍️', desc: 'Writing, video, and audience building.', owner: 'system' },
    { name: 'Product Management', icon: '📅', desc: 'Roadmaps, strategy, and user talks.', owner: 'system' },
    { name: 'Crypto & Web3', icon: '⛓️', desc: 'DeFi, NFTs, and DAOs.', owner: 'demo' },
    { name: 'Mobile Devs', icon: '📱', desc: 'iOS, Android, React Native, Flutter.', owner: 'system' },
    // New Demo Circles for Verification
    { name: 'General Lounge', icon: '☕', desc: 'Chill hangout for everyone.', owner: 'demo' },
    { name: 'Startup Ideas', icon: '💡', desc: 'Validate your crazy ideas here.', owner: 'system' },
    { name: 'EarnBuddy Feedback', icon: '📢', desc: 'Help us improve the platform!', owner: 'system' },
  ];

  for (const cat of categories) {
    const exists = await Room.findOne({ name: cat.name });
    if (exists) continue;

    const ownerId = cat.owner === 'demo' ? demoUserId : systemUserId;

    const room = await Room.create({
      name: cat.name,
      description: cat.desc,
      createdBy: ownerId,
      icon: cat.icon,
      isPrivate: false,
      membersCount: Math.floor(Math.random() * 50) + 5,
    });

    await RoomMembership.create({
      room: room._id,
      user: ownerId,
      role: 'admin',
    });
  }
}

async function seedEvents(posterId: mongoose.Types.ObjectId) {
  const existingEvents = await Event.countDocuments();
  if (existingEvents > 5) return;

  // Get some circles to host events
  const circles = await Room.find({ isPrivate: false }).limit(3);
  if (circles.length === 0) return;

  const eventData = [
    { name: 'Next.js 15 Launch Party', type: 'online' },
    { name: 'Design Systems Workshop', type: 'online' },
    { name: 'Indie Hacker Meetup - SF', type: 'offline', loc: 'San Francisco' },
    { name: 'AI Hackathon Kickoff', type: 'online' },
    { name: 'Weekly Co-working Session', type: 'online' }
  ];

  for (const evt of eventData) {
    const hostCircle = getRandom(circles);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 14) + 1); // Future date

    // Create temporary event circle
    const eventRoom = await Room.create({
      name: evt.name,
      description: `Event room for ${evt.name}`,
      createdBy: posterId,
      isPrivate: false,
      isTemporary: true,
      membersCount: 1,
      icon: '📅'
    });

    // Add creator to temporary room
    await RoomMembership.create({ room: eventRoom._id, user: posterId, role: 'admin' });

    await Event.create({
      name: evt.name,
      description: `Join us for ${evt.name}! It's going to be great.`,
      date: eventDate,
      hostCircles: [hostCircle._id],
      eventCircle: eventRoom._id,
      type: evt.type,
      location: evt.type === 'offline' ? evt.loc : 'Zoom / Google Meet',
      status: 'upcoming',
      createdBy: posterId
    });
  }
}

async function main() {
  try {
    await connect();

    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    await Room.deleteMany({});
    await RoomMembership.deleteMany({});
    await Event.deleteMany({});
    console.log('✨ Database cleared.');

    const demoUser = await ensureDemoUser();
    const systemUser = await ensureSystemUser();

    console.log('🌱 Seeding Startups...');
    await seedStartups(demoUser._id, demoUser.firebaseUid);

    console.log('🌱 Seeding Projects...');
    await seedProjects(demoUser._id, demoUser.firebaseUid);

    console.log('🌱 Seeding Circles...');
    await seedCircles(demoUser._id, systemUser._id);

    console.log('🌱 Seeding Events...');
    await seedEvents(demoUser._id);

    console.log('✅ Demo data seeding complete!');
  } catch (err) {
    console.error('❌ Failed to seed demo data:', err);
  } finally {
    await mongoose.disconnect();
  }
}

void main();
