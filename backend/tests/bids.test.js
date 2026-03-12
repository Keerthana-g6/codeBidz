const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/codebidz_test';

const { app } = require('../server');
const User = require('../models/User');
const Auction = require('../models/Auction');

let adminToken, bidderToken, auctionId, bidderId;

beforeAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin', email: 'admin_test@test.com', password: 'admin123', role: 'admin'
  });
  adminToken = adminRes.body.token;

  // Create bidder with credits
  const bidderRes = await request(app).post('/api/auth/register').send({
    name: 'Bidder', email: 'bidder_test@test.com', password: 'bidder123', role: 'bidder'
  });
  bidderToken = bidderRes.body.token;
  bidderId = bidderRes.body.user._id;

  // Give bidder credits
  await User.findByIdAndUpdate(bidderId, { credits: 1000 });

  // Create test auction
  const auction = await Auction.create({
    title: 'Test Auction',
    description: 'Test description for auction',
    startTime: new Date(Date.now() - 60000),
    endTime: new Date(Date.now() + 3600000),
    minimumBid: 10,
    status: 'active',
    createdBy: new mongoose.Types.ObjectId(),
  });
  auctionId = auction._id.toString();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Bidding API', () => {
  it('should place a valid bid', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', 'Bearer ' + bidderToken)
      .send({ auctionId, amount: 50 });
    expect(res.statusCode).toBe(201);
    expect(res.body.bid.amount).toBe(50);
  });

  it('should reject bid below minimum', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', 'Bearer ' + bidderToken)
      .send({ auctionId, amount: 5 });
    expect(res.statusCode).toBe(400);
  });

  it('should reject bid without auth', async () => {
    const res = await request(app)
      .post('/api/bids')
      .send({ auctionId, amount: 100 });
    expect(res.statusCode).toBe(401);
  });

  it('should reject admin placing bid', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ auctionId, amount: 100 });
    expect(res.statusCode).toBe(403);
  });

  it('should get my bid history', async () => {
    const res = await request(app)
      .get('/api/bids/my')
      .set('Authorization', 'Bearer ' + bidderToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
