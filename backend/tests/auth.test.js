const request = require('supertest');
const mongoose = require('mongoose');
const { startServer, stopServer } = require('../server');
const User = require('../models/User');

require('dotenv').config();

let app;
const port = Math.floor(Math.random() * 40000) + 10000; // ランダムなポート番号を生成


beforeAll(async () => {
    app = startServer(port);
});

afterAll(async () => {
    // テスト終了後にデータベースをクリーンアップ
    await User.deleteMany({});
    await mongoose.connection.close();

    stopServer();
});

describe('AuthAPIテスト', () => {
  it('ユーザー登録', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ username: 'testuser', password: 'testpassword'});
        
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
  });

  it('重複ユーザー登録', async () => {
    const response = await request(app)
    .post('/api/register')
    .send({ username: 'testuser', password: 'testpassword'});
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Username already exists');
  });

  it('ユーザーログイン', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword'});
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('username', 'testuser');
  });

  it('ユーザーログイン失敗', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword2'});

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('ユーザーログイン失敗2', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser2', password: 'testpassword'});

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

});