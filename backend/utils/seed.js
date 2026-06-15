/**
 * Seeds the database with a sample admin, provider, customer, services,
 * and provider profile data for quick local testing / demos.
 *
 * Usage: npm run seed
 */
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Service = require('../models/Service');

const run = async () => {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({ email: { $regex: '@demo.com$' } }),
    ProviderProfile.deleteMany({}),
    Service.deleteMany({}),
  ]);

  console.log('Creating demo users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
  });

  const provider = await User.create({
    name: 'Sara Khan',
    email: 'provider@demo.com',
    password: 'password123',
    role: 'provider',
  });

  const customer = await User.create({
    name: 'Ali Raza',
    email: 'customer@demo.com',
    password: 'password123',
    role: 'customer',
  });

  console.log('Creating provider profile...');
  await ProviderProfile.create({
    user: provider._id,
    title: 'Full Stack Web Developer',
    bio: 'I build fast, scalable web applications using the MERN stack with 4+ years of experience.',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS'],
    experienceYears: 4,
    hourlyRate: 25,
  });

  console.log('Creating sample services...');
  await Service.insertMany([
    {
      provider: provider._id,
      title: 'I will build a responsive React website',
      description:
        'A fully responsive, modern React + Tailwind website with up to 5 pages, contact form, and SEO basics.',
      category: 'Web Development',
      price: 150,
      deliveryTime: 7,
      tags: ['react', 'website', 'responsive'],
    },
    {
      provider: provider._id,
      title: 'I will design a modern logo for your brand',
      description:
        '3 unique logo concepts with unlimited revisions and final files in PNG, SVG, and PDF formats.',
      category: 'Graphic Design',
      price: 40,
      deliveryTime: 3,
      tags: ['logo', 'branding', 'design'],
    },
    {
      provider: provider._id,
      title: 'I will write SEO-optimized blog content',
      description: 'High-quality, plagiarism-free articles optimized for search engines (up to 1000 words).',
      category: 'Content Writing',
      price: 25,
      deliveryTime: 2,
      tags: ['seo', 'blog', 'content'],
    },
  ]);

  console.log('\nSeed complete! Demo accounts (password: password123):');
  console.log(`  Admin:    ${admin.email}`);
  console.log(`  Provider: ${provider.email}`);
  console.log(`  Customer: ${customer.email}`);

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
