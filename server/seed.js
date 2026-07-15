require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Startup = require('./models/Startup');
const Investor = require('./models/Investor');
const { Post, MentorProfile, Challenge } = require('./models/Others');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Startup.deleteMany({});
    await Investor.deleteMany({});
    await Post.deleteMany({});
    await MentorProfile.deleteMany({});
    await Challenge.deleteMany({});

    // Create users
    const users = await User.create([
      { name: 'Alex Chen', email: 'alex@demo.com', password: 'demo1234', role: 'founder', bio: 'Serial entrepreneur. Built 3 startups. Passionate about AI and sustainability.', location: 'San Francisco, CA', skills: ['Leadership', 'Product Strategy', 'Fundraising'], avatar: '' },
      { name: 'Sarah Johnson', email: 'sarah@demo.com', password: 'demo1234', role: 'investor', bio: 'Partner at Horizon Ventures. 10+ years in VC. Focused on deep tech and SaaS.', location: 'New York, NY', skills: ['Due Diligence', 'Portfolio Management', 'Deal Sourcing'], avatar: '' },
      { name: 'Raj Patel', email: 'raj@demo.com', password: 'demo1234', role: 'mentor', bio: 'Ex-Google, Ex-Meta. Advising startups on scaling engineering teams.', location: 'Austin, TX', skills: ['System Architecture', 'Team Building', 'Technical Leadership'], avatar: '' },
      { name: 'Emily Davis', email: 'emily@demo.com', password: 'demo1234', role: 'developer', bio: 'Full-stack developer. Open source contributor. Looking to join an early-stage startup.', location: 'Seattle, WA', skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'], avatar: '' },
      { name: 'James Wilson', email: 'james@demo.com', password: 'demo1234', role: 'early_adopter', bio: 'Tech enthusiast. Love testing new products and giving detailed feedback.', location: 'London, UK', skills: ['Product Testing', 'UX Research', 'Technical Writing'], avatar: '' },
      { name: 'Maria Garcia', email: 'maria@demo.com', password: 'demo1234', role: 'founder', bio: 'Building the future of healthcare. Former physician turned tech founder.', location: 'Boston, MA', skills: ['Healthcare', 'Product Design', 'Clinical Research'], avatar: '' },
      { name: 'David Kim', email: 'david@demo.com', password: 'demo1234', role: 'investor', bio: 'Angel investor. Invested in 20+ startups. Focus on fintech and edtech.', location: 'Singapore', skills: ['Angel Investing', 'Fintech', 'Market Analysis'], avatar: '' },
      { name: 'Lisa Thompson', email: 'lisa@demo.com', password: 'demo1234', role: 'mentor', bio: 'CMO at Scale. Mentor for growth marketing and brand strategy.', location: 'Chicago, IL', skills: ['Growth Marketing', 'Brand Strategy', 'Content Marketing'], avatar: '' },
      { name: 'Admin User', email: 'admin@demo.com', password: 'admin1234', role: 'admin', bio: 'Platform administrator', location: 'Global', skills: [], avatar: '' }
    ]);

    console.log(`Created ${users.length} users`);

    // Create startups
    const startups = await Startup.create([
      {
        founder: users[0]._id, name: 'NeuralFlow AI', tagline: 'AI-powered workflow automation for enterprises',
        problem: 'Enterprises waste 40% of employee time on repetitive tasks that could be automated.',
        solution: 'NeuralFlow uses advanced AI to learn, predict, and automate complex business workflows without coding.',
        description: 'NeuralFlow AI is building the future of enterprise automation. Our platform uses proprietary machine learning models to understand business processes, identify automation opportunities, and implement intelligent workflows that save companies millions in operational costs.',
        industry: 'ai_ml', targetMarket: 'Enterprise companies with 500+ employees',
        marketSize: { tam: '$50B', sam: '$12B', som: '$800M' },
        fundingStage: 'seed', fundingRequired: 2000000, fundingRaised: 500000,
        teamMembers: [
          { name: 'Alex Chen', role: 'CEO & Co-founder', linkedIn: '#' },
          { name: 'Priya Sharma', role: 'CTO & Co-founder', linkedIn: '#' },
          { name: 'Mike Roberts', role: 'Head of AI', linkedIn: '#' }
        ],
        techStack: ['Python', 'TensorFlow', 'React', 'Node.js', 'AWS', 'PostgreSQL'],
        websiteUrl: 'https://neuralflow.ai',
        credibilityScore: 82, successScore: 75, riskLevel: 'medium', growthPotential: 'very_high',
        metrics: { users: 1200, revenue: 150000, growth: 25, engagement: 78 },
        isLaunched: true, launchDate: new Date('2024-01-15'), isApproved: true, isFeatured: true,
        location: { city: 'San Francisco', country: 'USA', coordinates: { lat: 37.7749, lng: -122.4194 } },
        upvotes: [users[1]._id, users[2]._id, users[3]._id, users[4]._id, users[6]._id]
      },
      {
        founder: users[5]._id, name: 'MediConnect', tagline: 'Connecting patients with personalized care pathways',
        problem: 'Patients struggle to navigate complex healthcare systems and find the right specialists.',
        solution: 'AI-powered platform that maps patient symptoms to optimal care pathways and connects them with verified specialists.',
        description: 'MediConnect is revolutionizing healthcare navigation by using AI to create personalized care pathways for patients, reducing diagnosis time by 60% and improving outcomes.',
        industry: 'healthtech', targetMarket: 'Patients and healthcare providers in the US',
        marketSize: { tam: '$100B', sam: '$25B', som: '$2B' },
        fundingStage: 'pre_seed', fundingRequired: 1000000, fundingRaised: 150000,
        teamMembers: [
          { name: 'Maria Garcia', role: 'CEO & Founder', linkedIn: '#' },
          { name: 'John Lee', role: 'VP Engineering', linkedIn: '#' }
        ],
        techStack: ['React Native', 'Node.js', 'MongoDB', 'Python', 'GCP'],
        websiteUrl: 'https://mediconnect.health',
        credibilityScore: 68, successScore: 62, riskLevel: 'medium', growthPotential: 'high',
        metrics: { users: 350, revenue: 25000, growth: 40, engagement: 85 },
        isLaunched: true, launchDate: new Date('2024-02-20'), isApproved: true, isFeatured: false,
        location: { city: 'Boston', country: 'USA', coordinates: { lat: 42.3601, lng: -71.0589 } },
        upvotes: [users[0]._id, users[2]._id, users[4]._id]
      },
      {
        founder: users[0]._id, name: 'EcoTrack', tagline: 'Carbon footprint tracking for businesses',
        problem: 'Businesses lack easy tools to measure and reduce their carbon footprint.',
        solution: 'Automated carbon tracking platform that integrates with existing business tools.',
        description: 'EcoTrack provides real-time carbon footprint monitoring and actionable insights for sustainable business operations.',
        industry: 'cleantech', targetMarket: 'SMBs and mid-market companies',
        marketSize: { tam: '$20B', sam: '$5B', som: '$500M' },
        fundingStage: 'series_a', fundingRequired: 5000000, fundingRaised: 2000000,
        teamMembers: [
          { name: 'Alex Chen', role: 'CEO', linkedIn: '#' },
          { name: 'Emma White', role: 'COO', linkedIn: '#' },
          { name: 'Tom Brown', role: 'CTO', linkedIn: '#' },
          { name: 'Amy Liu', role: 'Head of Data', linkedIn: '#' }
        ],
        techStack: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'AWS'],
        websiteUrl: 'https://ecotrack.io',
        credibilityScore: 90, successScore: 85, riskLevel: 'low', growthPotential: 'very_high',
        metrics: { users: 5000, revenue: 800000, growth: 35, engagement: 72 },
        isLaunched: true, launchDate: new Date('2023-11-01'), isApproved: true, isFeatured: true,
        location: { city: 'New York', country: 'USA', coordinates: { lat: 40.7128, lng: -74.0060 } },
        upvotes: [users[1]._id, users[2]._id, users[3]._id, users[4]._id, users[5]._id, users[6]._id, users[7]._id]
      }
    ]);

    console.log(`Created ${startups.length} startups`);

    // Create investors
    const investors = await Investor.create([
      {
        user: users[1]._id, firmName: 'Horizon Ventures',
        investmentFocus: ['Enterprise SaaS', 'Deep Tech', 'AI/ML'],
        industries: ['ai_ml', 'saas', 'enterprise', 'cybersecurity'],
        stagePreference: ['seed', 'series_a'],
        ticketSize: { min: 500000, max: 5000000 },
        location: 'New York, NY',
        geographicPreference: ['USA', 'Europe', 'India'],
        portfolio: [
          { name: 'DataVault', industry: 'Enterprise', status: 'Active', investedAmount: 2000000 },
          { name: 'CloudSecure', industry: 'Cybersecurity', status: 'Exited', investedAmount: 1000000 }
        ],
        totalInvestments: 15, bio: 'Focused on transformative technology companies with strong founding teams.'
      },
      {
        user: users[6]._id, firmName: 'Dragon Capital',
        investmentFocus: ['Fintech', 'Edtech', 'Consumer'],
        industries: ['fintech', 'edtech', 'consumer', 'ecommerce'],
        stagePreference: ['pre_seed', 'seed'],
        ticketSize: { min: 50000, max: 500000 },
        location: 'Singapore',
        geographicPreference: ['Southeast Asia', 'India', 'USA'],
        portfolio: [
          { name: 'PayEasy', industry: 'Fintech', status: 'Active', investedAmount: 250000 },
          { name: 'LearnHub', industry: 'Edtech', status: 'Active', investedAmount: 150000 }
        ],
        totalInvestments: 22, bio: 'Angel investor passionate about democratizing access to financial services and education.'
      }
    ]);

    console.log(`Created ${investors.length} investor profiles`);

    // Create mentor profiles
    const mentors = await MentorProfile.create([
      {
        user: users[2]._id,
        expertise: ['technology', 'scaling', 'product'],
        yearsExperience: 15, company: 'Former Google', title: 'Senior Engineering Director',
        hourlyRate: 0, availability: 'available', rating: 4.8, totalSessions: 45
      },
      {
        user: users[7]._id,
        expertise: ['marketing', 'growth', 'fundraising'],
        yearsExperience: 12, company: 'Scale Inc', title: 'Chief Marketing Officer',
        hourlyRate: 0, availability: 'limited', rating: 4.6, totalSessions: 32
      }
    ]);

    console.log(`Created ${mentors.length} mentor profiles`);

    // Create posts
    const posts = await Post.create([
      {
        author: users[0]._id, content: '🚀 Excited to announce that NeuralFlow AI has crossed 1,000 active users! Our AI workflow automation is saving enterprises an average of 15 hours per employee per week. The future of work is intelligent automation. #startup #AI #milestone',
        type: 'update', startup: startups[0]._id, likes: [users[1]._id, users[2]._id, users[4]._id, users[5]._id],
        comments: [
          { user: users[1]._id, text: 'Incredible growth! The enterprise AI space is heating up. Would love to learn more about your go-to-market strategy.' },
          { user: users[2]._id, text: 'Congrats Alex! The product-market fit is clearly there. Happy to chat about scaling the engineering team.' }
        ], tags: ['ai', 'enterprise', 'milestone']
      },
      {
        author: users[5]._id, content: '🏥 We\'re looking for a senior React Native developer to join MediConnect. Help us build the future of healthcare navigation. Remote-friendly, equity included. If you\'re passionate about health tech, let\'s talk! #hiring #healthtech #reactnative',
        type: 'hiring', startup: startups[1]._id, likes: [users[3]._id, users[4]._id],
        comments: [
          { user: users[3]._id, text: 'Very interested! I have 4 years of React Native experience and a passion for healthcare. DM sent!' }
        ], tags: ['hiring', 'healthtech', 'reactnative']
      },
      {
        author: users[1]._id, content: '💡 What I look for in a seed-stage startup:\n\n1. A founding team that\'s 10x better than me at something\n2. A market that\'s growing faster than the competition can handle\n3. A product that users can\'t stop talking about\n4. Unit economics that make sense at scale\n\nDon\'t chase unicorn valuations. Chase unicorn impact. #investing #startups #vc',
        type: 'story', likes: [users[0]._id, users[2]._id, users[5]._id, users[6]._id, users[7]._id],
        comments: [
          { user: users[0]._id, text: 'This is gold. Point 3 is underrated — word of mouth is the best growth channel.' },
          { user: users[5]._id, text: 'Love this framework! Adding "regulatory moat" to my fundraising narrative.' }
        ], tags: ['investing', 'startups', 'vc', 'advice']
      },
      {
        author: users[2]._id, content: '🎓 Mentoring startups has taught me more about leadership than 15 years at Google. Every founder I meet reminds me why I love technology — it\'s not about the code, it\'s about the lives you change. Open to taking on 2 more mentees this quarter. DM me! #mentorship #startups',
        type: 'general', likes: [users[0]._id, users[5]._id],
        comments: [], tags: ['mentorship', 'startups', 'leadership']
      },
      {
        author: users[0]._id, content: '🌍 EcoTrack just closed our Series A at $5M! We\'re on a mission to make carbon tracking effortless for every business. Next stop: European expansion. Grateful to our investors, team, and 5,000+ customers who believe in a sustainable future. 🌱 #funding #cleantech #seriesA',
        type: 'funding', startup: startups[2]._id, likes: [users[1]._id, users[2]._id, users[3]._id, users[5]._id, users[6]._id, users[7]._id],
        comments: [
          { user: users[6]._id, text: 'Congratulations on the round! Clean tech is one of the most important sectors right now.' },
          { user: users[1]._id, text: 'Well deserved! EcoTrack\'s growth has been phenomenal.' }
        ], tags: ['funding', 'cleantech', 'seriesA']
      }
    ]);

    console.log(`Created ${posts.length} posts`);

    // Create challenges
    const challenges = await Challenge.create([
      {
        title: 'AI for Good Challenge',
        description: 'Build an AI-powered solution that addresses a pressing social or environmental issue. Top submissions will receive mentorship from industry leaders and visibility on the platform.',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true, prize: '$5,000 in cloud credits + mentorship',
        submissions: [
          { user: users[0]._id, title: 'AI Accessibility Assistant', description: 'AI tool that makes digital content accessible for people with disabilities', votes: [users[1]._id, users[2]._id, users[3]._id] },
          { user: users[5]._id, title: 'Health Disparity Detector', description: 'ML model that identifies healthcare access gaps in underserved communities', votes: [users[0]._id, users[4]._id] }
        ]
      }
    ]);

    console.log(`Created ${challenges.length} challenges`);
    console.log('\n✅ Seed data complete!');
    console.log('\nDemo accounts:');
    console.log('  Founder: alex@demo.com / demo1234');
    console.log('  Investor: sarah@demo.com / demo1234');
    console.log('  Mentor: raj@demo.com / demo1234');
    console.log('  Developer: emily@demo.com / demo1234');
    console.log('  Early Adopter: james@demo.com / demo1234');
    console.log('  Admin: admin@demo.com / admin1234');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
