const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

require('dotenv').config({ path: '../.env' }); // パスを修正

beforeAll(async () => {
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // 環境変数を確認

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/todo-app-test');
    }
  });

afterAll(async () => {
    // テスト終了後にデータベースをクリーンアップ
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('AuthAPIテスト', () => {
    it('ユーザー登録', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({ username: 'testuser', password: 'testpassword'});
        
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
    });
});