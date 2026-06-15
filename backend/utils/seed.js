/**
 * SkillBridge — Professional Database Seed Script
 *
 * Populates the database with realistic users, provider profiles,
 * service listings, service requests, and reviews for demo and
 * testing purposes. All images are sourced from Unsplash (free,
 * no API key required for direct image links).
 *
 * Usage:
 *   npm run seed              → wipe all seed data, re-insert fresh
 *   npm run seed -- --keep    → insert without wiping (not recommended for first run)
 *
 * After running, log in with any of the accounts below.
 * Password for every account: SkillBridge@2025
 */

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');

const SEED_PASSWORD = 'SkillBridge@2025';
const SEED_TAG = 'skillbridge_seed'; // used to identify & wipe seed data cleanly

// ---------------------------------------------------------------------------
// IMAGE ASSETS  (Unsplash direct CDN — no API key needed)
// ---------------------------------------------------------------------------
const IMG = {
  // Avatars
  avatar: {
    omar:     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    sara:     'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    ahmed:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    layla:    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    hassan:   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    nadia:    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    tariq:    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    admin:    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    customer1:'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80',
    customer2:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    customer3:'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&q=80',
  },
  // Service cover images
  service: {
    webdev1:  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
    webdev2:  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    design1:  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    design2:  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
    content1: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
    seo1:     'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80',
    video1:   'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
    uiux1:    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80',
    mobile1:  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    marketing:'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80',
  },
  // Portfolio images
  portfolio: {
    port1: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    port2: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
    port3: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    port4: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
    port5: 'https://images.unsplash.com/photo-1609921141835-710b7fa6e438?w=800&q=80',
    port6: 'https://images.unsplash.com/photo-1545235617-7a424c1a60cc?w=800&q=80',
  },
};

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------
const USERS = [
  // ── Admin ──────────────────────────────────────────────────────────────
  {
    name:   'Daniel Hartman',
    email:  'daniel.hartman@skillbridge.io',
    role:   'admin',
    phone:  '+1 (415) 820-3341',
    avatar: { url: IMG.avatar.admin, publicId: 'seed_avatar_admin' },
  },

  // ── Service Providers ──────────────────────────────────────────────────
  {
    name:   'Omar Al-Farsi',
    email:  'omar.alfarsi@gmail.com',
    role:   'provider',
    phone:  '+971 50 234 5678',
    avatar: { url: IMG.avatar.omar, publicId: 'seed_avatar_omar' },
  },
  {
    name:   'Sara Mitchell',
    email:  'sara.mitchell@protonmail.com',
    role:   'provider',
    phone:  '+44 7700 900142',
    avatar: { url: IMG.avatar.sara, publicId: 'seed_avatar_sara' },
  },
  {
    name:   'Ahmed Karimi',
    email:  'ahmed.karimi@outlook.com',
    role:   'provider',
    phone:  '+92 312 456 7890',
    avatar: { url: IMG.avatar.ahmed, publicId: 'seed_avatar_ahmed' },
  },
  {
    name:   'Layla Thornton',
    email:  'layla.thornton@gmail.com',
    role:   'provider',
    phone:  '+1 (646) 555-0182',
    avatar: { url: IMG.avatar.layla, publicId: 'seed_avatar_layla' },
  },
  {
    name:   'Hassan Malik',
    email:  'hassan.malik@icloud.com',
    role:   'provider',
    phone:  '+92 321 888 4512',
    avatar: { url: IMG.avatar.hassan, publicId: 'seed_avatar_hassan' },
  },
  {
    name:   'Nadia Rossi',
    email:  'nadia.rossi@gmail.com',
    role:   'provider',
    phone:  '+39 347 1234567',
    avatar: { url: IMG.avatar.nadia, publicId: 'seed_avatar_nadia' },
  },
  {
    name:   'Tariq Osei',
    email:  'tariq.osei@gmail.com',
    role:   'provider',
    phone:  '+233 244 567 890',
    avatar: { url: IMG.avatar.tariq, publicId: 'seed_avatar_tariq' },
  },

  // ── Customers ──────────────────────────────────────────────────────────
  {
    name:   'James Whitfield',
    email:  'james.whitfield@techstartup.io',
    role:   'customer',
    phone:  '+1 (312) 555-0139',
    avatar: { url: IMG.avatar.customer1, publicId: 'seed_avatar_customer1' },
  },
  {
    name:   'Priya Nair',
    email:  'priya.nair@businessmail.com',
    role:   'customer',
    phone:  '+91 98765 43210',
    avatar: { url: IMG.avatar.customer2, publicId: 'seed_avatar_customer2' },
  },
  {
    name:   'Carlos Mendes',
    email:  'carlos.mendes@empresa.com.br',
    role:   'customer',
    phone:  '+55 11 91234-5678',
    avatar: { url: IMG.avatar.customer3, publicId: 'seed_avatar_customer3' },
  },
];

// ---------------------------------------------------------------------------
// PROVIDER PROFILES  (indexed by provider email)
// ---------------------------------------------------------------------------
const PROFILES = {
  'omar.alfarsi@gmail.com': {
    title: 'Senior Full Stack Engineer & Cloud Architect',
    bio: `I am a senior full stack engineer with over 7 years of professional experience 
building scalable SaaS products, internal tools, and API-driven platforms for clients 
across the fintech, e-commerce, and healthcare sectors. My expertise spans the entire 
development lifecycle — from system architecture and database design to deployment on 
AWS and Google Cloud. I hold AWS Certified Solutions Architect and MongoDB Professional 
Developer certifications. Every engagement begins with a thorough discovery call to 
understand your business objectives, followed by a detailed technical proposal and 
transparent milestones. I guarantee clean, well-documented, production-ready code.`,
    skills: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
             'AWS', 'Docker', 'TypeScript', 'GraphQL', 'Redis', 'Kubernetes'],
    experienceYears: 7,
    hourlyRate: 65,
    availability: 'available',
    avgRating: 4.9,
    numReviews: 43,
    completedProjects: 67,
    totalEarnings: 48500,
    portfolio: [
      {
        title: 'NovaPay — Fintech Payment Gateway',
        description: 'End-to-end payment processing platform handling $2M+ monthly transactions. Built with Next.js, Node.js, Stripe Connect, and PostgreSQL. Includes real-time webhook processing and a React admin dashboard.',
        image: { url: IMG.portfolio.port1, publicId: 'seed_port_omar1' },
        link: 'https://github.com',
      },
      {
        title: 'MedTrack — Patient Management System',
        description: 'HIPAA-compliant clinic management software serving 12 healthcare providers. Features appointment scheduling, electronic health records, and insurance billing integration.',
        image: { url: IMG.portfolio.port2, publicId: 'seed_port_omar2' },
        link: 'https://github.com',
      },
    ],
  },

  'sara.mitchell@protonmail.com': {
    title: 'UI/UX Designer & Brand Identity Specialist',
    bio: `Creative director and brand strategist with 5 years of experience partnering with 
startups and established businesses to create compelling visual identities that resonate 
with their target audience. I specialize in transforming complex brand narratives into 
clean, memorable design systems — from initial concept exploration and user research 
through to final deliverable production. My design process is collaborative and 
research-driven; I use tools like Figma, Adobe Illustrator, and Maze for usability 
testing. Previous clients include funded startups in Series A–C stages and Fortune 500 
marketing teams. I deliver structured Figma files, comprehensive brand guidelines, and 
ready-to-export assets in all required formats.`,
    skills: ['Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'UI Design',
             'UX Research', 'Brand Identity', 'Wireframing', 'Prototyping',
             'Motion Design', 'Design Systems', 'User Testing'],
    experienceYears: 5,
    hourlyRate: 55,
    availability: 'available',
    avgRating: 4.8,
    numReviews: 31,
    completedProjects: 54,
    totalEarnings: 32200,
    portfolio: [
      {
        title: 'Luminary Health — Brand Identity System',
        description: 'Complete visual identity for a digital health startup: logo suite, color palette, typography system, icon library, and a 40-page brand guidelines document. Designed for a Series B funding announcement.',
        image: { url: IMG.portfolio.port3, publicId: 'seed_port_sara1' },
        link: 'https://behance.net',
      },
      {
        title: 'Vantage Finance — Dashboard UI Redesign',
        description: 'Full UX audit and UI overhaul of a B2B analytics dashboard. Reduced user task completion time by 38% through improved information architecture and a consistent component library.',
        image: { url: IMG.portfolio.port4, publicId: 'seed_port_sara2' },
        link: 'https://dribbble.com',
      },
    ],
  },

  'ahmed.karimi@outlook.com': {
    title: 'Mobile Application Developer (iOS & Android)',
    bio: `Mobile-first engineer specializing in cross-platform application development 
with React Native and Flutter, as well as native iOS (Swift) development. Over 4 years 
I have shipped 14 apps to the App Store and Google Play, collectively earning over 
500,000 downloads. My workflow covers the complete mobile product lifecycle: requirement 
analysis, UX wireframing, development, App Store Optimization (ASO), and post-launch 
support. I am experienced integrating Firebase, Stripe mobile SDKs, push notifications, 
biometric authentication, and offline-first architectures. I provide complete source 
code ownership, detailed README documentation, and a 30-day post-launch support window 
at no additional charge.`,
    skills: ['React Native', 'Flutter', 'Swift', 'iOS Development',
             'Android Development', 'Firebase', 'Redux', 'REST APIs',
             'App Store Optimization', 'Push Notifications', 'SQLite'],
    experienceYears: 4,
    hourlyRate: 45,
    availability: 'available',
    avgRating: 4.7,
    numReviews: 22,
    completedProjects: 38,
    totalEarnings: 21800,
    portfolio: [
      {
        title: 'Grocer — On-Demand Grocery Delivery App',
        description: 'React Native app for iOS and Android with real-time order tracking, integrated Stripe payments, and a Node.js backend. Reached 50,000 downloads in the first 90 days post-launch.',
        image: { url: IMG.portfolio.port5, publicId: 'seed_port_ahmed1' },
        link: 'https://github.com',
      },
    ],
  },

  'layla.thornton@gmail.com': {
    title: 'SEO Strategist & Content Marketing Consultant',
    bio: `Results-driven SEO specialist and content marketing consultant with 6 years 
of experience helping businesses grow organic traffic and rank on the first page of 
Google. I have managed SEO campaigns for clients in e-commerce, SaaS, legal, and 
healthcare industries — consistently delivering measurable results including 120–400% 
organic traffic growth within six months. My methodology combines comprehensive 
technical SEO audits (Core Web Vitals, crawlability, schema markup), authoritative 
link-building outreach, and a data-led keyword strategy aligned to your buyer's journey. 
All deliverables include detailed analytics reports and a prioritized 90-day action plan 
tailored to your competitive landscape.`,
    skills: ['Technical SEO', 'On-Page SEO', 'Link Building', 'Content Strategy',
             'Google Analytics 4', 'Google Search Console', 'Ahrefs', 'SEMrush',
             'Core Web Vitals', 'Schema Markup', 'Keyword Research', 'Copywriting'],
    experienceYears: 6,
    hourlyRate: 50,
    availability: 'available',
    avgRating: 4.6,
    numReviews: 18,
    completedProjects: 41,
    totalEarnings: 28700,
    portfolio: [
      {
        title: 'LegalEdge — 340% Organic Traffic Growth',
        description: 'Comprehensive 12-month SEO engagement for a US-based law firm. Achieved 340% increase in organic sessions, 18 featured snippets, and a 60% reduction in bounce rate through targeted content restructuring.',
        image: { url: IMG.portfolio.port6, publicId: 'seed_port_layla1' },
        link: 'https://linkedin.com',
      },
    ],
  },

  'hassan.malik@icloud.com': {
    title: 'Video Editor & Motion Graphics Designer',
    bio: `Professional video editor and motion graphics artist with 5 years of experience 
producing high-impact content for YouTube channels, corporate presentations, social 
media campaigns, and product launch videos. I have worked with content creators boasting 
audiences of 1M+ subscribers as well as marketing teams at mid-market technology 
companies. My toolkit includes Adobe Premiere Pro, After Effects, DaVinci Resolve, and 
Cinema 4D. I specialize in narrative-driven storytelling, dynamic motion graphics 
packages, and colour grading that aligns precisely with your brand identity. Deliverables 
include the final export in all required formats and resolutions, a project source file 
archive, and royalty-free music licensing clearance documentation where applicable.`,
    skills: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Cinema 4D',
             'Motion Graphics', 'Color Grading', 'Sound Design', 'YouTube Optimization',
             'Corporate Video', 'Social Media Content', 'Green Screen / VFX'],
    experienceYears: 5,
    hourlyRate: 40,
    availability: 'available',
    avgRating: 4.8,
    numReviews: 27,
    completedProjects: 49,
    totalEarnings: 19400,
    portfolio: [],
  },

  'nadia.rossi@gmail.com': {
    title: 'Content Strategist & Technical Copywriter',
    bio: `Certified content strategist and B2B copywriter with 4 years of experience 
producing high-converting written content for technology, finance, and professional 
services brands. I combine editorial precision with an SEO-first mindset to create 
whitepapers, case studies, blog articles, landing page copy, and LinkedIn content that 
drives qualified traffic and nurtures leads through the sales funnel. My background 
in software engineering (BSc Computer Science) allows me to engage authentically with 
technical subject matter without sacrificing readability for a non-technical audience. 
Turnaround for a standard 1,500-word article is 48 hours. All copy is Copyscape-cleared, 
Grammarly Pro-reviewed, and delivered with two rounds of revision included.`,
    skills: ['Technical Writing', 'SEO Copywriting', 'Blog Writing', 'Whitepaper Writing',
             'Case Studies', 'Email Marketing Copy', 'LinkedIn Content', 'UX Writing',
             'Editing & Proofreading', 'Content Strategy', 'WordPress'],
    experienceYears: 4,
    hourlyRate: 35,
    availability: 'available',
    avgRating: 4.9,
    numReviews: 36,
    completedProjects: 72,
    totalEarnings: 24600,
    portfolio: [],
  },

  'tariq.osei@gmail.com': {
    title: 'Digital Marketing Manager & Growth Hacker',
    bio: `Performance marketing specialist with 5 years of experience building and 
scaling paid advertising, email automation, and social media growth programmes for 
D2C e-commerce brands and B2B SaaS companies. I have managed aggregate ad budgets 
exceeding $1.2M across Google Ads, Meta Ads, LinkedIn Campaign Manager, and TikTok 
Ads — consistently delivering ROAS of 4× and above. My growth stack includes HubSpot, 
Klaviyo, Google Tag Manager, Hotjar, and Zapier. I approach each campaign with a 
structured testing framework: hypothesis → A/B test → analyse → scale. You will 
receive weekly performance reports with transparent attribution data and a clear 
interpretation of what is working and what we are optimising next.`,
    skills: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'Email Marketing',
             'HubSpot', 'Klaviyo', 'Google Analytics 4', 'Conversion Rate Optimisation',
             'Marketing Automation', 'Growth Hacking', 'A/B Testing'],
    experienceYears: 5,
    hourlyRate: 48,
    availability: 'available',
    avgRating: 4.7,
    numReviews: 19,
    completedProjects: 33,
    totalEarnings: 22100,
    portfolio: [],
  },
};

// ---------------------------------------------------------------------------
// SERVICES
// ---------------------------------------------------------------------------
function buildServices(providerMap) {
  return [
    // ── Omar Al-Farsi — Full Stack ──────────────────────────────────────
    {
      provider: providerMap['omar.alfarsi@gmail.com'],
      title: 'I will architect and develop a full-stack MERN web application',
      description: `Delivery includes a production-ready, fully tested MERN stack application 
deployed to your chosen cloud provider (AWS, GCP, or Railway).

What you receive:
• React 18 frontend with Redux Toolkit or Zustand state management
• Node.js / Express REST API with JWT authentication and role-based access control
• MongoDB database with Mongoose schemas, indexes, and seed data
• Cloudinary integration for file and image uploads
• Responsive UI built with Tailwind CSS and shadcn/ui components
• CI/CD pipeline configured via GitHub Actions
• Docker Compose setup for local development
• Comprehensive API documentation (Postman collection included)

This package covers projects up to 10 core features / modules. A discovery call 
is included before work begins to align on requirements, wireframes, and milestones.
Complex projects with third-party integrations (Stripe, Twilio, etc.) are quoted 
separately after the call.`,
      category: 'Web Development',
      price: 850,
      deliveryTime: 21,
      images: [
        { url: IMG.service.webdev1, publicId: 'seed_svc_omar1_img1' },
        { url: IMG.service.webdev2, publicId: 'seed_svc_omar1_img2' },
      ],
      tags: ['mern', 'react', 'nodejs', 'mongodb', 'fullstack', 'api', 'aws'],
      isActive: true,
      ordersCount: 14,
    },
    {
      provider: providerMap['omar.alfarsi@gmail.com'],
      title: 'I will build a RESTful API with Node.js, Express, and MongoDB',
      description: `A robust, scalable, and well-documented REST API built to industry 
best practices, ready for integration with any frontend or mobile application.

Deliverables:
• Authentication: JWT access + refresh tokens, bcrypt password hashing
• Comprehensive CRUD endpoints with pagination, sorting, and filtering
• Input validation using express-validator with consistent error response format
• Rate limiting, CORS configuration, and security headers (helmet.js)
• Cloudinary or AWS S3 file upload middleware
• MongoDB aggregation pipelines for analytics endpoints
• Swagger / OpenAPI 3.0 documentation auto-generated from code
• Unit and integration tests (Jest + Supertest) with >80% code coverage
• Deployment-ready: Dockerfile, .env.example, and Railway/Render configuration

API scope: up to 8 resource types / collections. Request a custom quote 
for larger data models or microservice architectures.`,
      category: 'Web Development',
      price: 420,
      deliveryTime: 10,
      images: [{ url: IMG.service.webdev2, publicId: 'seed_svc_omar2_img1' }],
      tags: ['nodejs', 'express', 'api', 'rest', 'mongodb', 'backend', 'swagger'],
      isActive: true,
      ordersCount: 22,
    },

    // ── Sara Mitchell — Design ──────────────────────────────────────────
    {
      provider: providerMap['sara.mitchell@protonmail.com'],
      title: 'I will design a premium brand identity system for your business',
      description: `A comprehensive, investor-ready brand identity package built around 
deep discovery of your business goals, audience, and competitive positioning.

Package includes:
• Brand strategy workshop (1-hour Zoom session, recorded for your records)
• Three distinct logo concepts presented in a structured brand deck
• Unlimited revision rounds until you are 100% satisfied
• Primary logo, secondary / stacked logo, and icon / favicon variants
• Full brand colour palette with HEX, RGB, CMYK, and Pantone references
• Typography system with primary and secondary typeface recommendations
• Brand voice and tone guidelines (1–2 pages)
• Business card, letterhead, and email signature templates
• Final Figma source file and export package (PNG, SVG, PDF, EPS)
• Commercial usage rights: full ownership transferred upon final payment

Turnaround: 5 business days for initial concepts. Rush delivery (48 hours) 
available at a 40% surcharge.`,
      category: 'Graphic Design',
      price: 380,
      deliveryTime: 7,
      images: [
        { url: IMG.service.design1, publicId: 'seed_svc_sara1_img1' },
        { url: IMG.service.design2, publicId: 'seed_svc_sara1_img2' },
      ],
      tags: ['brand identity', 'logo design', 'figma', 'branding', 'startup'],
      isActive: true,
      ordersCount: 18,
    },
    {
      provider: providerMap['sara.mitchell@protonmail.com'],
      title: 'I will design a high-converting landing page UI in Figma',
      description: `A visually compelling, conversion-optimised landing page design 
crafted to turn visitors into customers or leads.

What is included:
• Discovery questionnaire to capture brand tone, target audience, and conversion goal
• Desktop and mobile-responsive layouts (1440px and 375px artboards)
• Up to 8 sections: hero, features, social proof, pricing, FAQ, CTA
• Micro-interactions and hover state definitions for developer handoff
• Custom illustration or icon set selection guidance
• Copy structure recommendations (headline formulas, CTA language)
• Figma file with organised component library and auto-layout frames
• Developer handoff inspection panel enabled on Figma

Not included: copywriting, image sourcing, or HTML/CSS development.
These can be added as separate packages — message me to bundle and save.`,
      category: 'UI/UX Design',
      price: 220,
      deliveryTime: 5,
      images: [{ url: IMG.service.uiux1, publicId: 'seed_svc_sara2_img1' }],
      tags: ['landing page', 'figma', 'ui design', 'ux', 'conversion', 'saas'],
      isActive: true,
      ordersCount: 11,
    },

    // ── Ahmed Karimi — Mobile ───────────────────────────────────────────
    {
      provider: providerMap['ahmed.karimi@outlook.com'],
      title: 'I will develop a cross-platform mobile app with React Native',
      description: `A feature-complete React Native application published to both the 
Apple App Store and Google Play Store, built with the same codebase.

Included in this package:
• Up to 8 screens with React Navigation (stack, tab, and drawer navigators)
• Authentication flow: signup, login, password reset, and optional social OAuth
• Firebase Firestore real-time database and Firebase Authentication integration
• Push notifications via Expo Notifications or OneSignal
• Camera access, image picker, and Cloudinary upload integration
• Offline support with AsyncStorage and optimistic UI updates
• App Store and Google Play submission (assets preparation and review guidance)
• 30 days of post-launch bug-fix support at no additional charge
• Full source code and environment configuration delivered via private GitHub repository

Payments (Stripe), maps (Google Maps), or advanced AR features are available 
as add-ons — please message before ordering to confirm scope.`,
      category: 'Mobile Development',
      price: 950,
      deliveryTime: 25,
      images: [{ url: IMG.service.mobile1, publicId: 'seed_svc_ahmed1_img1' }],
      tags: ['react native', 'mobile', 'ios', 'android', 'firebase', 'app store'],
      isActive: true,
      ordersCount: 9,
    },

    // ── Layla Thornton — SEO ───────────────────────────────────────────
    {
      provider: providerMap['layla.thornton@gmail.com'],
      title: 'I will conduct a comprehensive technical SEO audit and deliver a 90-day action plan',
      description: `A forensic-level technical SEO audit covering every factor that 
influences how Google crawls, indexes, and ranks your website.

What the audit covers:
• Crawlability and indexation analysis (Screaming Frog + Google Search Console data)
• Core Web Vitals assessment (LCP, CLS, FID) with PageSpeed Insights integration
• Site architecture and internal linking review
• Duplicate content and canonicalisation audit
• Schema markup / structured data validation
• Broken links, redirect chains, and orphaned pages identification
• Backlink profile review and toxic link flagging
• Mobile-friendliness and International SEO (hreflang) review
• Competitor gap analysis (up to 3 competitors)

Deliverables:
• 40–60 page audit report with annotated screenshots
• Prioritised issue tracker (Critical / High / Medium / Low) in Notion or Excel
• 90-day implementation roadmap aligned to your team's capacity
• 45-minute strategy call to walk through findings and answer questions`,
      category: 'SEO',
      price: 320,
      deliveryTime: 6,
      images: [{ url: IMG.service.seo1, publicId: 'seed_svc_layla1_img1' }],
      tags: ['seo audit', 'technical seo', 'core web vitals', 'google', 'organic traffic'],
      isActive: true,
      ordersCount: 15,
    },

    // ── Hassan Malik — Video ───────────────────────────────────────────
    {
      provider: providerMap['hassan.malik@icloud.com'],
      title: 'I will edit and produce a professional YouTube video with motion graphics',
      description: `A polished, broadcast-quality YouTube video that hooks viewers 
in the first three seconds and maintains watch time through dynamic pacing and visuals.

This package includes:
• Video editing of raw footage up to 20 minutes of source material
• Custom animated intro / outro sequence (10 seconds, brand-matched)
• Lower-third name tags and chapter title cards
• Motion graphics for data visualisation, product demos, or key statistics
• Colour grading calibrated to your brand palette
• Professional audio clean-up: noise reduction, EQ, compression, and volume normalisation
• Licensed background music selection from Epidemic Sound or Artlist
• Subtitles / closed captions (SRT file delivered separately)
• Export in 1080p and 4K where source footage allows
• Two revision rounds included; additional rounds at $25 each

Typical use cases: tutorial videos, product launches, vlogs, corporate training, 
documentary shorts, and YouTube Shorts (vertical format available on request).`,
      category: 'Video Editing',
      price: 180,
      deliveryTime: 4,
      images: [{ url: IMG.service.video1, publicId: 'seed_svc_hassan1_img1' }],
      tags: ['youtube', 'video editing', 'motion graphics', 'after effects', 'premiere pro'],
      isActive: true,
      ordersCount: 21,
    },

    // ── Nadia Rossi — Content ──────────────────────────────────────────
    {
      provider: providerMap['nadia.rossi@gmail.com'],
      title: 'I will write SEO-optimised long-form blog articles for your website',
      description: `Expert-level, thoroughly researched blog content that ranks on 
Google, earns backlinks, and converts readers into subscribers or customers.

Package: 1 article (up to 2,000 words)

My writing process:
1. Keyword research and SERP analysis to identify the exact search intent
2. Competitor content gap analysis (top 5 ranking pages)
3. First draft with optimised H1, H2, H3 structure and semantic keyword distribution
4. Internal linking recommendations to boost your topical authority
5. Meta title and meta description variants (A/B testable)
6. Two revision rounds based on your editorial feedback
7. Final delivery in Google Docs (clean, publication-ready) and plain HTML

Standards I uphold on every article:
• Copyscape plagiarism clearance certificate included
• Grammarly Pro final pass (grammar, clarity, engagement score)
• Flesch-Kincaid readability score reported and optimised for your audience
• No AI-generated filler text — every word is researched and written by me

Turnaround: 72 hours for first draft after brief submission.`,
      category: 'Content Writing',
      price: 95,
      deliveryTime: 3,
      images: [{ url: IMG.service.content1, publicId: 'seed_svc_nadia1_img1' }],
      tags: ['blog writing', 'seo content', 'copywriting', 'long form', 'content marketing'],
      isActive: true,
      ordersCount: 29,
    },

    // ── Tariq Osei — Marketing ─────────────────────────────────────────
    {
      provider: providerMap['tariq.osei@gmail.com'],
      title: 'I will set up and manage a Google Ads campaign to drive qualified leads',
      description: `End-to-end Google Ads campaign management designed to generate 
high-intent traffic and measurable leads or sales within your target cost-per-acquisition.

Monthly management package includes:
• Account and campaign structure audit (or build from scratch)
• Keyword research and negative keyword list construction
• Ad copywriting: 3–5 responsive search ads per ad group, A/B tested
• Audience targeting configuration: in-market, custom intent, remarketing
• Google Ads conversion tracking setup via Google Tag Manager
• Bid strategy optimisation (Target CPA or Target ROAS aligned to your goals)
• Landing page review and Conversion Rate Optimisation recommendations
• Weekly performance summary and monthly deep-dive report
• Access to a shared live Google Looker Studio dashboard
• Direct Slack or WhatsApp channel for real-time communication

Minimum recommended ad spend: $1,500/month (not included in service fee).
Industries with restricted categories (healthcare, legal, financial products) 
may require additional compliance review — please discuss before ordering.`,
      category: 'Digital Marketing',
      price: 450,
      deliveryTime: 30,
      images: [{ url: IMG.service.marketing, publicId: 'seed_svc_tariq1_img1' }],
      tags: ['google ads', 'ppc', 'lead generation', 'sem', 'digital advertising', 'roas'],
      isActive: true,
      ordersCount: 12,
    },
  ];
}

// ---------------------------------------------------------------------------
// SERVICE REQUESTS + STATUS HISTORY
// ---------------------------------------------------------------------------
function buildRequests(serviceMap, customerMap, providerMap) {
  const now = new Date();
  const daysAgo = (n) => new Date(now - n * 86400000);
  const daysFromNow = (n) => new Date(now.getTime() + n * 86400000);

  return [
    // ── Delivered + Reviewed ────────────────────────────────────────────
    {
      service:      serviceMap['mern'],
      customer:     customerMap['james.whitfield@techstartup.io'],
      provider:     providerMap['omar.alfarsi@gmail.com'],
      requirements: `We need a multi-tenant SaaS platform for a B2B project management tool. 
Core modules required:
  • Organisation / workspace management with user invitations
  • Kanban board with drag-and-drop task management (React DnD)
  • Time tracking and simple invoicing (PDF export)
  • Role-based access: Owner, Admin, Member, Viewer
  • Stripe subscription billing (monthly and annual plans)
  • Email notifications via Nodemailer / SendGrid
  
Tech preferences: React + TypeScript frontend, Node.js + Express API, MongoDB Atlas, 
hosted on Railway. Please include Jest unit tests for all service-layer functions.`,
      budget:   1200,
      deadline: daysAgo(5),
      status:   'Delivered',
      isReviewed: true,
      statusHistory: [
        { status: 'Pending',     changedAt: daysAgo(28) },
        { status: 'Accepted',    changedAt: daysAgo(26) },
        { status: 'In Progress', changedAt: daysAgo(25) },
        { status: 'Completed',   changedAt: daysAgo(7)  },
        { status: 'Delivered',   changedAt: daysAgo(5)  },
      ],
    },

    // ── In Progress ─────────────────────────────────────────────────────
    {
      service:      serviceMap['brand'],
      customer:     customerMap['priya.nair@businessmail.com'],
      provider:     providerMap['sara.mitchell@protonmail.com'],
      requirements: `Brand identity package for a wellness and mindfulness app targeting 
professional women aged 28–45 in urban markets.

Brand direction:
  • Feeling: calm, trustworthy, premium — NOT clinical or corporate
  • Colour territory: warm neutrals, sage green, or dusty rose (open to direction)
  • Logo must work as an app icon at 1024×1024px and in monochrome
  • Avoid: gradients that look dated, overly geometric tech aesthetics

Deliverables needed:
  • Primary logo + icon variant
  • Brand colour palette (4–5 colours)
  • Font system recommendation (Google Fonts preferred for budget reasons)
  • Brand guidelines PDF
  • App icon exported at Apple/Google required sizes
  
Timeline is flexible — quality over speed. Happy to do a kick-off call next week.`,
      budget:   400,
      deadline: daysFromNow(5),
      status:   'In Progress',
      isReviewed: false,
      statusHistory: [
        { status: 'Pending',     changedAt: daysAgo(8) },
        { status: 'Accepted',    changedAt: daysAgo(7) },
        { status: 'In Progress', changedAt: daysAgo(5) },
      ],
    },

    // ── Accepted ────────────────────────────────────────────────────────
    {
      service:      serviceMap['video'],
      customer:     customerMap['carlos.mendes@empresa.com.br'],
      provider:     providerMap['hassan.malik@icloud.com'],
      requirements: `Corporate product launch video for our new SaaS analytics platform — 
"DataPulse". The video will be used on our homepage hero section and LinkedIn.

Raw footage: We will provide 15 minutes of recorded screen demos and 8 minutes 
of talking-head footage (CEO interview, already filmed in 4K).

Editing requirements:
  • Duration: 90 seconds final cut (cut for attention spans)
  • Open with a punchy hook showing the product dashboard in action
  • Integrate our brand colours: midnight navy (#0D1B3E) and electric teal (#00E5C8)
  • Animated kinetic typography for key statistics (e.g. "Save 12 hrs/week")
  • Call-to-action card at the end: "Start Free Trial — datapulse.io"
  • Subtle background music (tech / corporate — no vocals)
  • Export: 16:9 (1920×1080) for web, 1:1 (square) for LinkedIn

Please do NOT use stock footage of people at laptops smiling. We want authentic 
product footage only.`,
      budget:   220,
      deadline: daysFromNow(8),
      status:   'Accepted',
      isReviewed: false,
      statusHistory: [
        { status: 'Pending',  changedAt: daysAgo(3) },
        { status: 'Accepted', changedAt: daysAgo(1) },
      ],
    },

    // ── Pending ──────────────────────────────────────────────────────────
    {
      service:      serviceMap['seo'],
      customer:     customerMap['james.whitfield@techstartup.io'],
      provider:     providerMap['layla.thornton@gmail.com'],
      requirements: `Technical SEO audit for techstartup.io — a B2B SaaS platform 
for remote team management (approximately 180 indexed pages, React SPA with SSR via Next.js).

Context:
  • We migrated from WordPress to Next.js 6 months ago and traffic dropped 35%
  • Suspect issues: duplicate meta tags, incorrect canonical tags, and crawl budget waste
  • Google Search Console shows 340 "Excluded — Discovered, currently not indexed" pages

Priority areas for the audit:
  1. Diagnose the post-migration traffic drop (full historical GSC export will be shared)
  2. Crawlability and indexation of the Next.js dynamic routes
  3. Core Web Vitals — we score 48 on Performance in PageSpeed Insights (mobile)
  4. Structured data implementation for SaaS product review schema

Deliverables expected: audit report + 90-day roadmap. Please include 
a 45-minute walkthrough call — we have a junior developer who will implement 
the fixes and needs context.`,
      budget:   350,
      deadline: daysFromNow(12),
      status:   'Pending',
      isReviewed: false,
      statusHistory: [
        { status: 'Pending', changedAt: daysAgo(1) },
      ],
    },

    // ── Completed (awaiting customer Delivered confirmation) ─────────────
    {
      service:      serviceMap['content'],
      customer:     customerMap['priya.nair@businessmail.com'],
      provider:     providerMap['nadia.rossi@gmail.com'],
      requirements: `Three long-form blog articles for our wellness app's content hub.

Article briefs:
  1. "The Science of Digital Detox: What 7 Days Without Your Phone Does to Your Brain"
     → Target keyword: "digital detox benefits" (2,800 searches/mo, KD 38)
     → Audience: busy professional women considering a digital wellness practice

  2. "Mindful Mornings: A 15-Minute Routine Backed by Neuroscience"
     → Target keyword: "morning mindfulness routine" (4,100 searches/mo, KD 42)
     → Include citations from peer-reviewed studies (Journal of Positive Psychology preferred)

  3. "How to Set Boundaries With Technology at Work (Without Killing Your Productivity)"
     → Target keyword: "technology boundaries at work" (1,200 searches/mo, KD 31)
     → Practical, actionable — readers should finish with a checklist they can use today

Style guide: conversational but authoritative. First-person voice is acceptable. 
Maximum readability score of 65 Flesch-Kincaid (write for a 10th-grade reading level).`,
      budget:   285,
      deadline: daysAgo(2),
      status:   'Completed',
      isReviewed: false,
      statusHistory: [
        { status: 'Pending',     changedAt: daysAgo(12) },
        { status: 'Accepted',    changedAt: daysAgo(11) },
        { status: 'In Progress', changedAt: daysAgo(10) },
        { status: 'Completed',   changedAt: daysAgo(2)  },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// REVIEWS
// ---------------------------------------------------------------------------
function buildReviews(requestRef, serviceRef, customerRef, providerRef) {
  return [
    {
      request:  requestRef,
      service:  serviceRef,
      customer: customerRef,
      provider: providerRef,
      rating:   5,
      comment: `Omar exceeded every expectation on this project. He asked precisely the 
right questions during our discovery call, identified an architectural decision I had 
not considered that saved us significant cost in the long run, and delivered the entire 
platform a full two days ahead of schedule. Code quality is outstanding — clean 
architecture, comprehensive test coverage, and documentation clear enough that our 
junior devs could onboard immediately. Will absolutely be returning for our next phase.`,
    },
  ];
}

// ---------------------------------------------------------------------------
// MAIN SEED RUNNER
// ---------------------------------------------------------------------------
const run = async () => {
  await connectDB();

  const keepExisting = process.argv.includes('--keep');

  if (!keepExisting) {
    console.log('\n🗑  Clearing existing seed data...');
    const seedEmails = USERS.map((u) => u.email);
    const existingUsers = await User.find({ email: { $in: seedEmails } });
    const seedUserIds = existingUsers.map((u) => u._id);

    await Promise.all([
      User.deleteMany({ email: { $in: seedEmails } }),
      ProviderProfile.deleteMany({ user: { $in: seedUserIds } }),
      Service.deleteMany({ provider: { $in: seedUserIds } }),
      ServiceRequest.deleteMany({
        $or: [{ customer: { $in: seedUserIds } }, { provider: { $in: seedUserIds } }],
      }),
      Review.deleteMany({ provider: { $in: seedUserIds } }),
    ]);
    console.log('   ✓ Previous seed data removed.\n');
  }

  // ── Create users ────────────────────────────────────────────────────
  console.log('👤  Creating users...');
  const createdUsers = {};
  for (const userData of USERS) {
    const user = await User.create({
      name:     userData.name,
      email:    userData.email,
      password: SEED_PASSWORD,
      role:     userData.role,
      phone:    userData.phone,
      avatar:   userData.avatar,
    });
    createdUsers[userData.email] = user;
    console.log(`   ✓ [${userData.role.padEnd(8)}] ${userData.name} <${userData.email}>`);
  }

  // ── Create provider profiles ────────────────────────────────────────
  console.log('\n📋  Creating provider profiles...');
  for (const [email, profile] of Object.entries(PROFILES)) {
    const user = createdUsers[email];
    await ProviderProfile.create({
      user:               user._id,
      title:              profile.title,
      bio:                profile.bio,
      skills:             profile.skills,
      experienceYears:    profile.experienceYears,
      hourlyRate:         profile.hourlyRate,
      availability:       profile.availability,
      avgRating:          profile.avgRating,
      numReviews:         profile.numReviews,
      completedProjects:  profile.completedProjects,
      totalEarnings:      profile.totalEarnings,
      portfolio:          profile.portfolio,
    });
    console.log(`   ✓ Profile for ${createdUsers[email].name}`);
  }

  // ── Create services ──────────────────────────────────────────────────
  console.log('\n🛍  Creating service listings...');
  const providerMap = {};
  for (const [email, user] of Object.entries(createdUsers)) {
    if (user.role === 'provider') providerMap[email] = user._id;
  }

  const rawServices = buildServices(providerMap);
  const createdServices = await Service.insertMany(rawServices);

  // Build a lookup by short key for request building
  const serviceMap = {
    mern:    createdServices[0]._id,
    api:     createdServices[1]._id,
    brand:   createdServices[2]._id,
    landing: createdServices[3]._id,
    mobile:  createdServices[4]._id,
    seo:     createdServices[5]._id,
    video:   createdServices[6]._id,
    content: createdServices[7]._id,
    ads:     createdServices[8]._id,
  };
  console.log(`   ✓ ${createdServices.length} services created`);

  // ── Create service requests ──────────────────────────────────────────
  console.log('\n📬  Creating service requests...');
  const customerMap = {};
  for (const [email, user] of Object.entries(createdUsers)) {
    if (user.role === 'customer') customerMap[email] = user._id;
  }

  const rawRequests = buildRequests(serviceMap, customerMap, providerMap);
  const createdRequests = [];

  for (const reqData of rawRequests) {
    const req = await ServiceRequest.create({
      service:      reqData.service,
      customer:     reqData.customer,
      provider:     reqData.provider,
      requirements: reqData.requirements,
      budget:       reqData.budget,
      deadline:     reqData.deadline,
      status:       reqData.status,
      isReviewed:   reqData.isReviewed,
      statusHistory: reqData.statusHistory.map((h) => ({
        status:    h.status,
        changedAt: h.changedAt,
      })),
    });
    createdRequests.push(req);
    console.log(`   ✓ Request [${req.status.padEnd(11)}] — ${reqData.requirements.split('\n')[0].trim().slice(0, 70)}...`);
  }

  // ── Create review for the delivered request ──────────────────────────
  console.log('\n⭐  Creating reviews...');
  const deliveredRequest = createdRequests.find((r) => r.status === 'Delivered');

  if (deliveredRequest) {
    const rawReviews = buildReviews(
      deliveredRequest._id,
      deliveredRequest.service,
      deliveredRequest.customer,
      deliveredRequest.provider
    );
    await Review.insertMany(rawReviews);
    console.log(`   ✓ ${rawReviews.length} review(s) created`);
  }

  // ── Summary ──────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅  SkillBridge seed complete!');
  console.log('  🔑  Password for ALL accounts: SkillBridge@2025');
  console.log('═══════════════════════════════════════════════════════════\n');

  const roles = { admin: [], provider: [], customer: [] };
  for (const [email, user] of Object.entries(createdUsers)) {
    roles[user.role].push(email);
  }

  console.log('  ADMIN:');
  roles.admin.forEach((e) => console.log(`    • ${e}`));

  console.log('\n  PROVIDERS:');
  roles.provider.forEach((e) => console.log(`    • ${e}`));

  console.log('\n  CUSTOMERS:');
  roles.customer.forEach((e) => console.log(`    • ${e}`));

  console.log('\n  DATABASE SUMMARY:');
  console.log(`    Users:            ${Object.keys(createdUsers).length}`);
  console.log(`    Provider Profiles:${Object.keys(PROFILES).length}`);
  console.log(`    Service Listings: ${createdServices.length}`);
  console.log(`    Service Requests: ${createdRequests.length}`);
  console.log(`    Reviews:          1`);
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(0);
};

run().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});