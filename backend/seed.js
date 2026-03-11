// Run: node seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Auction = require('./models/Auction');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Auction.deleteMany({});
  console.log('Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@codebidz.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create bidders
  const bidders = await User.create([
    { name: 'Alice Johnson', email: 'alice@example.com', password: 'bidder123', role: 'bidder', credits: 1000 },
    { name: 'Bob Smith', email: 'bob@example.com', password: 'bidder123', role: 'bidder', credits: 1500 },
    { name: 'Carol White', email: 'carol@example.com', password: 'bidder123', role: 'bidder', credits: 800 },
    { name: 'Demo Bidder', email: 'bidder@codebidz.com', password: 'bidder123', role: 'bidder', credits: 2000 },
  ]);

  const now = new Date();
  // Create sample auctions
  await Auction.create([
    {
      title: 'Vintage Rolex Submariner 1966',
      description: 'An exceptional timepiece in remarkable condition. Original bracelet, box, and papers included. A true collector\'s item with proven provenance.',
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
      startTime: new Date(now.getTime() - 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      minimumBid: 500,
      category: 'Jewelry',
      status: 'active',
      createdBy: admin._id,
      tags: ['vintage', 'luxury', 'watch'],
    },
    {
      title: 'Abstract Oil Painting "Cosmic Dreams"',
      description: 'A stunning large-format abstract expressionist work measuring 120x90cm. Vivid blues and golds evoke the infinite cosmos.',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      minimumBid: 200,
      category: 'Art',
      status: 'active',
      createdBy: admin._id,
      tags: ['art', 'painting', 'abstract'],
    },
    {
      title: 'MacBook Pro M3 Max 16" (2024)',
      description: 'Brand new sealed MacBook Pro with M3 Max chip, 36GB RAM, 1TB SSD. Space Black. Full Apple warranty included.',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      minimumBid: 1000,
      category: 'Electronics',
      status: 'upcoming',
      createdBy: admin._id,
      tags: ['apple', 'laptop', 'tech'],
    },
    {
      title: 'Limited Edition Air Jordan 1 Retro OG',
      description: 'Deadstock Chicago colorway, size US 10. Never worn, original box and laces. One of 500 pairs in this limited release.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      startTime: new Date(now.getTime() - 30 * 60 * 1000),
      endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      minimumBid: 150,
      category: 'Fashion',
      status: 'active',
      createdBy: admin._id,
      tags: ['sneakers', 'jordan', 'limited'],
    },
  ]);

  console.log('✅ Seed complete!');
  console.log('\nDemo accounts:');
  console.log('Admin: admin@codebidz.com / admin123');
  console.log('Bidder: bidder@codebidz.com / bidder123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
