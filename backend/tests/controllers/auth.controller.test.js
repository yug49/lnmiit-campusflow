const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const User = require('../../models/User');
const app = require('../../server');

// Mock the User model
jest.mock('../../models/User');

describe('Auth Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  describe('User Registration', () => {
    const userData = {
      name: 'Test User',
      email: 'test@lnmiit.ac.in',
      password: 'Password123!',
      role: 'student'
    };

    test('should register a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      User.findOne.mockResolvedValue(null);
      
      // Mock User.create to return the new user
      const mockedUser = {
        ...userData,
        _id: 'mockUserId',
        password: await bcrypt.hash(userData.password, 10)
      };
      User.create.mockResolvedValue(mockedUser);
      
      // Mock jwt.sign
      jest.spyOn(jwt, 'sign').mockReturnValue('mockedToken');
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('mockedToken');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should not register user with existing email', async () => {
      // Mock User.findOne to return an existing user
      User.findOne.mockResolvedValue({ email: userData.email });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    test('should handle registration errors', async () => {
      // Mock User.findOne to return null
      User.findOne.mockResolvedValue(null);
      
      // Mock User.create to throw an error
      User.create.mockRejectedValue(new Error('Database error'));
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Registration failed');
    });
  });

  describe('User Login', () => {
    const loginData = {
      email: 'test@lnmiit.ac.in',
      password: 'Password123!'
    };

    test('should login user successfully with correct credentials', async () => {
      // Create a mock user with a password that will match
      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      const mockedUser = {
        _id: 'mockUserId',
        email: loginData.email,
        password: hashedPassword,
        name: 'Test User',
        role: 'student',
        permissions: [],
        comparePassword: async function(candidatePassword) {
          return bcrypt.compare(candidatePassword, this.password);
        }
      };
      
      // Mock User.findOne to return the mocked user
      User.findOne.mockResolvedValue(mockedUser);
      
      // Mock jwt.sign
      jest.spyOn(jwt, 'sign').mockReturnValue('mockedToken');
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('mockedToken');
      expect(res.body.user).toBeDefined();
    });

    test('should not login with invalid email', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      User.findOne.mockResolvedValue(null);
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    test('should not login with incorrect password', async () => {
      // Create a mock user with a password that won't match
      const mockedUser = {
        _id: 'mockUserId',
        email: loginData.email,
        password: await bcrypt.hash('DifferentPassword', 10),
        name: 'Test User',
        role: 'student',
        comparePassword: async function(candidatePassword) {
          return bcrypt.compare(candidatePassword, this.password);
        }
      };
      
      // Mock User.findOne to return the mocked user
      User.findOne.mockResolvedValue(mockedUser);
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    test('should handle login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: loginData.email })  // Missing password
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('provide email and password');
    });
  });

  describe('Token Verification', () => {
    test('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid token');
    });

    test('should reject request with no token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });
  });

  
});