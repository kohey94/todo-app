const request = require('supertest');
const mongoose = require('mongoose');
const { startServer, stopServer } = require('../server');
const Todo = require('../models/Todo');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

let token;

let app;
const port = Math.floor(Math.random() * 40000) + 10000; // ランダムなポート番号を生成

beforeAll(async () => {
    // テストユーザーの作成
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = new User({ username: 'testtodouser', password: hashedPassword });
    await user.save();
  
    // トークンの生成
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    app = startServer(port);
});

afterAll(async () => {
    await Todo.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();

    stopServer();
});


describe('Todo API Tests', () => {
    it('should get an empty todo list initially', async () => {
        const response = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${token}`);
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
    
    it('should create a new todo', async () => {
        const response = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Todo' });
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Test Todo');
        expect(response.body).toHaveProperty('completed', false);
    });
    
    it('should get a list of todos', async () => {
        const response = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${token}`);
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty('name', 'Test Todo');
    });
    
    it('should update a todo', async () => {
        const todos = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${token}`);
    
        const todoId = todos.body[0]._id;
    
        const response = await request(app)
            .put(`/api/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Todo', completed: true });
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated Todo');
        expect(response.body).toHaveProperty('completed', true);
    });
    
    it('should delete a todo', async () => {
        const todos = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${token}`);
    
        const todoId = todos.body[0]._id;
    
        const response = await request(app)
            .delete(`/api/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`);
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated Todo');
    });
});
