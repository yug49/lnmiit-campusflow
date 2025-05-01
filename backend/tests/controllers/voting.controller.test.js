const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const Candidate = require('../../models/Candidate');
const Vote = require('../../models/Vote');
const VotingSession = require('../../models/VotingSession');
const User = require('../../models/User');
const app = require('../../server');

// Mock the models
jest.mock('../../models/User');
jest.mock('../../models/Candidate');
jest.mock('../../models/Vote');
jest.mock('../../models/VotingSession');

describe('Voting Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  // Helper function to create auth token for test user
  const createTestToken = (userId, role = 'student') => {
    return jwt.sign({ id: userId }, config.jwtSecret);
  };

  describe('Candidature Submission', () => {
    const userId = 'user123';
    const candidateData = {
      position: 'President',
      batch: '2022-26',
      statement: 'My election statement',
      experience: 'Previous experience',
      achievements: 'My achievements'
    };

    test('should submit new candidature successfully', async () => {
      // Mock User.findById for auth middleware
      User.findById.mockResolvedValue({
        _id: userId,
        role: 'student',
        name: 'Test Student'
      });
      
      // Mock Candidate.findOne to return null (no existing candidature)
      Candidate.findOne.mockResolvedValue(null);
      
      // Mock new candidate creation
      const mockedCandidate = {
        _id: 'candidate123',
        user: userId,
        position: candidateData.position,
        batch: candidateData.batch,
        statement: candidateData.statement,
        experience: candidateData.experience,
        achievements: candidateData.achievements,
        status: 'Pending',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Candidate.mockImplementation(() => mockedCandidate);
      
      const token = createTestToken(userId);
      
      const res = await request(app)
        .post('/api/voting/candidature')
        .set('Authorization', `Bearer ${token}`)
        .send(candidateData)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('submitted successfully');
      expect(res.body.candidate).toBeDefined();
    });

    test('should not allow duplicate candidature for same position', async () => {
      // Mock User.findById for auth middleware
      User.findById.mockResolvedValue({
        _id: userId,
        role: 'student',
        name: 'Test Student'
      });
      
      // Mock existing candidature
      const existingCandidate = {
        _id: 'candidate123',
        user: userId,
        position: candidateData.position,
        status: 'Pending'
      };
      
      Candidate.findOne.mockResolvedValue(existingCandidate);
      
      const token = createTestToken(userId);
      
      const res = await request(app)
        .post('/api/voting/candidature')
        .set('Authorization', `Bearer ${token}`)
        .send(candidateData)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already applied');
    });

    test('should allow resubmission if previous application was rejected', async () => {
      // Mock User.findById for auth middleware
      User.findById.mockResolvedValue({
        _id: userId,
        role: 'student',
        name: 'Test Student'
      });
      
      // Mock existing rejected candidature
      const existingCandidate = {
        _id: 'candidate123',
        user: userId,
        position: candidateData.position,
        status: 'Rejected',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Candidate.findOne.mockResolvedValue(existingCandidate);
      
      const token = createTestToken(userId);
      
      const res = await request(app)
        .post('/api/voting/candidature')
        .set('Authorization', `Bearer ${token}`)
        .send(candidateData)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('resubmitted');
      expect(existingCandidate.save).toHaveBeenCalled();
      expect(existingCandidate.status).toBe('Pending');
    });
  });

  describe('Voting Session Management', () => {
    const adminId = 'admin123';
    const studentId = 'student123';

    test('should authorize a student for voting as admin', async () => {
      // Mock User.findById for admin auth
      User.findById.mockImplementation((id) => {
        if (id === adminId) {
          return Promise.resolve({
            _id: adminId,
            role: 'admin',
            name: 'Admin User'
          });
        }
        if (id === studentId) {
          return Promise.resolve({
            _id: studentId,
            role: 'student',
            name: 'Student User'
          });
        }
        return Promise.resolve(null);
      });
      
      // Mock no existing vote
      Vote.findOne.mockResolvedValue(null);
      
      // Mock VotingSession.updateMany
      VotingSession.updateMany.mockResolvedValue({ nModified: 0 });
      
      // Mock new voting session creation
      const mockedSession = {
        _id: 'session123',
        student: studentId,
        authorizedBy: adminId,
        expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes from now
        active: true,
        save: jest.fn().mockResolvedValue(true)
      };
      
      VotingSession.mockImplementation(() => mockedSession);
      
      const token = createTestToken(adminId, 'admin');
      
      const res = await request(app)
        .post('/api/voting/authorize-voter')
        .set('Authorization', `Bearer ${token}`)
        .send({ studentId })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('authorized for voting');
      expect(res.body.session).toBeDefined();
    });

    test('should not authorize student who already voted', async () => {
      // Mock User.findById for admin auth
      User.findById.mockResolvedValue({
        _id: adminId,
        role: 'admin',
        name: 'Admin User'
      });
      
      // Mock student
      User.findById.mockImplementation((id) => {
        if (id === adminId) {
          return Promise.resolve({
            _id: adminId,
            role: 'admin',
            name: 'Admin User'
          });
        }
        if (id === studentId) {
          return Promise.resolve({
            _id: studentId,
            role: 'student',
            name: 'Student User'
          });
        }
        return Promise.resolve(null);
      });
      
      // Mock existing vote
      Vote.findOne.mockResolvedValue({ _id: 'vote123', voter: studentId });
      
      const token = createTestToken(adminId, 'admin');
      
      const res = await request(app)
        .post('/api/voting/authorize-voter')
        .set('Authorization', `Bearer ${token}`)
        .send({ studentId })
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already voted');
    });

    test('should check if student is authorized to vote', async () => {
      // Mock User.findById for student auth
      User.findById.mockResolvedValue({
        _id: studentId,
        role: 'student',
        name: 'Student User'
      });
      
      // Mock no existing vote
      Vote.findOne.mockResolvedValue(null);
      
      // Mock active voting session
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 5);
      
      VotingSession.findOne.mockResolvedValue({
        _id: 'session123',
        student: studentId,
        active: true,
        expiresAt: futureDate
      });
      
      const token = createTestToken(studentId);
      
      const res = await request(app)
        .get('/api/voting/check-authorization')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.authorized).toBe(true);
      expect(res.body.session).toBeDefined();
    });

    test('should indicate if student has already voted', async () => {
      // Mock User.findById for student auth
      User.findById.mockResolvedValue({
        _id: studentId,
        role: 'student',
        name: 'Student User'
      });
      
      // Mock existing vote
      Vote.findOne.mockResolvedValue({ _id: 'vote123', voter: studentId });
      
      const token = createTestToken(studentId);
      
      const res = await request(app)
        .get('/api/voting/check-authorization')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.authorized).toBe(false);
      expect(res.body.alreadyVoted).toBe(true);
    });
  });

  describe('Vote Casting', () => {
    const studentId = 'student123';
    const votes = {
      'President': 'candidate1',
      'Vice President': 'candidate2'
    };

    test('should cast votes successfully', async () => {
      // Mock User.findById for student auth
      User.findById.mockResolvedValue({
        _id: studentId,
        role: 'student',
        name: 'Student User'
      });
      
      // Mock no existing vote
      Vote.findOne.mockResolvedValue(null);
      
      // Mock active voting session
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 5);
      
      const session = {
        _id: 'session123',
        student: studentId,
        active: true,
        expiresAt: futureDate,
        save: jest.fn().mockResolvedValue(true)
      };
      
      VotingSession.findOne.mockResolvedValue(session);
      
      // Mock candidate validation
      Candidate.findOne.mockImplementation((query) => {
        if (
          (query._id === 'candidate1' && query.position === 'President') ||
          (query._id === 'candidate2' && query.position === 'Vice President')
        ) {
          return Promise.resolve({ _id: query._id, position: query.position, status: 'Approved' });
        }
        return Promise.resolve(null);
      });
      
      // Mock Vote creation
      const voteMock = {
        _id: 'vote123',
        voter: studentId,
        votes: new Map(),
        save: jest.fn().mockResolvedValue(true)
      };
      
      voteMock.votes.set = jest.fn();
      Vote.mockImplementation(() => voteMock);
      
      const token = createTestToken(studentId);
      
      const res = await request(app)
        .post('/api/voting/cast')
        .set('Authorization', `Bearer ${token}`)
        .send({ votes })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('recorded successfully');
      expect(session.active).toBe(false);
      expect(session.save).toHaveBeenCalled();
      expect(voteMock.save).toHaveBeenCalled();
    });

    test('should not allow voting with expired session', async () => {
      // Mock User.findById for student auth
      User.findById.mockResolvedValue({
        _id: studentId,
        role: 'student',
        name: 'Student User'
      });
      
      // Mock no existing vote
      Vote.findOne.mockResolvedValue(null);
      
      // Mock expired or inactive session
      VotingSession.findOne.mockResolvedValue(null);
      
      const token = createTestToken(studentId);
      
      const res = await request(app)
        .post('/api/voting/cast')
        .set('Authorization', `Bearer ${token}`)
        .send({ votes })
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    test('should not allow voting twice', async () => {
      // Mock User.findById for student auth
      User.findById.mockResolvedValue({
        _id: studentId,
        role: 'student',
        name: 'Student User'
      });
      
      // Mock existing vote
      Vote.findOne.mockResolvedValue({ _id: 'vote123', voter: studentId });
      
      const token = createTestToken(studentId);
      
      const res = await request(app)
        .post('/api/voting/cast')
        .set('Authorization', `Bearer ${token}`)
        .send({ votes })
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already cast');
    });
  });

  describe('Admin Candidature Management', () => {
    const adminId = 'admin123';
    const candidateId = 'candidate123';

    test('should allow admin to update candidature status', async () => {
      // Mock User.findById for admin auth
      User.findById.mockResolvedValue({
        _id: adminId,
        role: 'admin',
        name: 'Admin User'
      });
      
      // Mock candidate
      const candidateMock = {
        _id: candidateId,
        status: 'Pending',
        remark: '',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Candidate.findById.mockResolvedValue(candidateMock);
      
      const token = createTestToken(adminId, 'admin');
      const updateData = { status: 'Approved', remark: 'Looks good' };
      
      const res = await request(app)
        .put(`/api/voting/candidatures/${candidateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('updated successfully');
      expect(candidateMock.status).toBe('Approved');
      expect(candidateMock.remark).toBe('Looks good');
      expect(candidateMock.save).toHaveBeenCalled();
    });

    test('should not allow non-admin to update candidature status', async () => {
      // Mock User.findById for student auth
      User.findById.mockResolvedValue({
        _id: 'student123',
        role: 'student',
        name: 'Student User'
      });
      
      const token = createTestToken('student123', 'student');
      const updateData = { status: 'Approved', remark: 'Looks good' };
      
      const res = await request(app)
        .put(`/api/voting/candidatures/${candidateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });
  });

  describe('Election Results', () => {
    const adminId = 'admin123';

    test('should allow admin to see election results', async () => {
      // Mock User.findById for admin auth
      User.findById.mockResolvedValue({
        _id: adminId,
        role: 'admin',
        name: 'Admin User'
      });
      
      // Mock approved candidates
      const candidates = [
        {
          _id: 'candidate1',
          position: 'President',
          status: 'Approved',
          user: { _id: 'user1', name: 'User 1', rollNumber: 'Roll1' }
        },
        {
          _id: 'candidate2',
          position: 'President',
          status: 'Approved',
          user: { _id: 'user2', name: 'User 2', rollNumber: 'Roll2' }
        },
        {
          _id: 'candidate3',
          position: 'Vice President',
          status: 'Approved',
          user: { _id: 'user3', name: 'User 3', rollNumber: 'Roll3' }
        }
      ];
      
      Candidate.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(candidates)
        })
      });
      
      // Mock votes
      const votes = [
        { 
          votes: { 'President': 'candidate1', 'Vice President': 'candidate3' }
        },
        { 
          votes: { 'President': 'candidate1', 'Vice President': 'candidate3' }
        },
        { 
          votes: { 'President': 'candidate2', 'Vice President': 'candidate3' }
        }
      ];
      
      Vote.find.mockResolvedValue(votes);
      
      const token = createTestToken(adminId, 'admin');
      
      const res = await request(app)
        .get('/api/voting/results')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.results).toBeDefined();
      expect(res.body.totalVotes).toBe(3);
    });

    test('should not allow non-admin to see election results', async () => {
      // Mock User.findById for student auth
      User.findById.mockResolvedValue({
        _id: 'student123',
        role: 'student',
        name: 'Student User'
      });
      
      const token = createTestToken('student123', 'student');
      
      const res = await request(app)
        .get('/api/voting/results')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });
  });

  describe('System Status', () => {
    const adminId = 'admin123';

    test('should update voting system status as admin', async () => {
      // Mock User.findById for admin auth
      User.findById.mockResolvedValue({
        _id: adminId,
        role: 'admin',
        name: 'Admin User'
      });
      
      const token = createTestToken(adminId, 'admin');
      
      const res = await request(app)
        .put('/api/voting/system-status')
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: false })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.isActive).toBe(false);
    });

    test('should reset election as admin', async () => {
      // Mock User.findById for admin auth
      User.findById.mockResolvedValue({
        _id: adminId,
        role: 'admin',
        name: 'Admin User'
      });
      
      // Mock delete operations
      Vote.deleteMany.mockResolvedValue({ deletedCount: 10 });
      Candidate.deleteMany.mockResolvedValue({ deletedCount: 5 });
      VotingSession.deleteMany.mockResolvedValue({ deletedCount: 20 });
      
      const token = createTestToken(adminId, 'admin');
      
      const res = await request(app)
        .post('/api/voting/reset')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset successfully');
      expect(Vote.deleteMany).toHaveBeenCalled();
      expect(Candidate.deleteMany).toHaveBeenCalled();
      expect(VotingSession.deleteMany).toHaveBeenCalled();
    });
  });
});