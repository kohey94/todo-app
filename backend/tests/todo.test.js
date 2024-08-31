const request = require('supertest');
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');

require('dotenv').config();

let tokenA;
let tokenB;

beforeAll(async () => {
    // テスト用のMongoDB URIで接続
  await mongoose.connect(process.env.MONGODB_TEST_URI);

  // テストユーザーの作成
  const hashedPassA = await bcrypt.hash('testpassA', 10);
  const userA = new User({ username: 'userA', password: hashedPassA });
  await userA.save();
  tokenA = jwt.sign({ userId: userA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  // テストユーザーの作成
  const hashedPassB = await bcrypt.hash('testpassB', 10);
  const userB = new User({ username: 'userB', password: hashedPassB });
  await userB.save();
  tokenB = jwt.sign({ userId: userB._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  
});

afterAll(async () => {
    await Todo.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();

});


describe('Todo API Tests', () => {
    it('should get an empty todo list initially', async () => {
        const response = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${tokenA}`)
            ;
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
    
    it('should create a new todo', async () => {
        const response = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'Test Todo' });
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Test Todo');
        expect(response.body).toHaveProperty('completed', false);
    });
    
    it('should get a list of todos', async () => {
        const response = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${tokenA}`)
            ;
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty('name', 'Test Todo');
    });
    
    it('should update a todo', async () => {
        const todos = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${tokenA}`)
            ;
    
        const todoId = todos.body[0]._id;
    
        const response = await request(app)
            .put(`/api/todos/${todoId}`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'Updated Todo', completed: true });
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated Todo');
        expect(response.body).toHaveProperty('completed', true);
    });
    
    it('should delete a todo', async () => {
        const todos = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${tokenA}`)
            ;
    
        const todoId = todos.body[0]._id;
    
        const response = await request(app)
            .delete(`/api/todos/${todoId}`)
            .set('Authorization', `Bearer ${tokenA}`)
            ;
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated Todo');
    });

    
    it('should show User A\'s todo only to User A and not to User B', async () => {
        // ユーザーAとしてTodoを作成
        const createResponseA = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'User A Todo' });
    
        expect(createResponseA.statusCode).toBe(200);
        expect(createResponseA.body).toHaveProperty('name', 'User A Todo');
    
        // ユーザーAのTodoがユーザーAのリストに存在することを確認
        const getTodosResponseA = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${tokenA}`);
        
        expect(getTodosResponseA.statusCode).toBe(200);
        expect(Array.isArray(getTodosResponseA.body)).toBe(true);
        expect(getTodosResponseA.body.length).toBe(1);
        expect(getTodosResponseA.body[0]).toHaveProperty('name', 'User A Todo');
    
        // ユーザーBとしてTodoリストを取得し、ユーザーAのTodoが見えないことを確認
        const getTodosResponseB = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${tokenB}`);
    
        expect(getTodosResponseB.statusCode).toBe(200);
        expect(Array.isArray(getTodosResponseB.body)).toBe(true);
        expect(getTodosResponseB.body.length).toBe(0); // ユーザーBにはユーザーAのTodoが見えないことを確認
    });

});
