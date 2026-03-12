const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/codebidz_test';

const { app } = require('../server');

beforeAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    role: 'bidder',
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should not register with duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  it('should reject login with missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: '',
    });
    expect(res.statusCode).toBe(400);
  });
});