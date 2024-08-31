const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const app = require('../app');

require('dotenv').config();

// let app;
// const port = Math.floor(Math.random() * 40000) + 10000; // ランダムなポート番号を生成


beforeAll(async () => {
  // テスト用のMongoDB URIで接続
  await mongoose.connect(process.env.MONGODB_TEST_URI);
});

afterAll(async () => {
  // テスト終了後にデータベースをクリーンアップ
  await User.deleteMany({});
  await mongoose.connection.close();

    
});

describe('AuthAPIテスト', () => {
  it('ユーザー登録', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpassword'});
        
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
  });

  it('重複ユーザー登録', async () => {
    const response = await request(app)
    .post('/api/auth/register')
    .send({ username: 'testuser', password: 'testpassword'});
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Username already exists');
  });

  it('ユーザーログイン', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword'});
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('username', 'testuser');
  });

  it('ユーザーログイン失敗', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword2'});

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('ユーザーログイン失敗2', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser2', password: 'testpassword'});

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });
});