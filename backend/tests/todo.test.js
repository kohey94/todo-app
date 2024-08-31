const request = require('supertest');
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');

require('dotenv').config();

beforeAll(async () => {
    // テスト用のMongoDB URIで接続
  await mongoose.connect(process.env.MONGODB_TEST_URI);

  // テストユーザーの作成
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  const user = new User({ username: 'testtodouser', password: hashedPassword });
  await user.save();
  
  
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
            //.set('Authorization', `Bearer ${token}`)
            ;
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
    
    it('should create a new todo', async () => {
        const response = await request(app)
            .post('/api/todos')
            //.set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Todo' });
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Test Todo');
        expect(response.body).toHaveProperty('completed', false);
    });
    
    it('should get a list of todos', async () => {
        const response = await request(app)
            .get('/api/todos')
            //.set('Authorization', `Bearer ${token}`)
            ;
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty('name', 'Test Todo');
    });
    
    it('should update a todo', async () => {
        const todos = await request(app)
            .get('/api/todos')
            //.set('Authorization', `Bearer ${token}`)
            ;
    
        const todoId = todos.body[0]._id;
    
        const response = await request(app)
            .put(`/api/todos/${todoId}`)
            //.set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Todo', completed: true });
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated Todo');
        expect(response.body).toHaveProperty('completed', true);
    });
    
    it('should delete a todo', async () => {
        const todos = await request(app)
            .get('/api/todos')
            //.set('Authorization', `Bearer ${token}`)
            ;
    
        const todoId = todos.body[0]._id;
    
        const response = await request(app)
            .delete(`/api/todos/${todoId}`)
            //.set('Authorization', `Bearer ${token}`)
            ;
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated Todo');
    });

    
    // it('should show User A\'s todo only to User A and not to User B', async () => {
    //     // ユーザーAの登録
    //     const registerResponseA = await request(app)
    //         .post('/api/auth/register')
    //         .send({ username: 'userA', password: 'passwordA' });
    
    //     expect(registerResponseA.statusCode).toBe(201); // 登録成功のステータスコード
    
    //     // ユーザーAでログインしてトークンを取得
    //     const loginResponseA = await request(app)
    //         .post('/api/auth/login')
    //         .send({ username: 'userA', password: 'passwordA' });
    
    //     expect(loginResponseA.statusCode).toBe(200); // ログイン成功のステータスコード
    //     const tokenA = loginResponseA.body.token; // トークンを取得
    
    //     // ユーザーAとしてTodoを作成
    //     const createResponseA = await request(app)
    //         .post('/api/todos')
    //         .set('Authorization', `Bearer ${tokenA}`)
    //         .send({ name: 'User A Todo' });
    
    //     expect(createResponseA.statusCode).toBe(200);
    //     expect(createResponseA.body).toHaveProperty('name', 'User A Todo');
    
    //     // ユーザーAのTodoがユーザーAのリストに存在することを確認
    //     const getTodosResponseA = await request(app)
    //         .get('/api/todos')
    //         .set('Authorization', `Bearer ${tokenA}`);
        
    //     expect(getTodosResponseA.statusCode).toBe(200);
    //     expect(Array.isArray(getTodosResponseA.body)).toBe(true);
    //     expect(getTodosResponseA.body.length).toBe(1);
    //     expect(getTodosResponseA.body[0]).toHaveProperty('name', 'User A Todo');
    
    //     // ユーザーBの登録
    //     const registerResponseB = await request(app)
    //         .post('/api/auth/register')
    //         .send({ username: 'userB', password: 'passwordB' });
    
    //     expect(registerResponseB.statusCode).toBe(201); // 登録成功のステータスコード
    
    //     // ユーザーBでログインしてトークンを取得
    //     const loginResponseB = await request(app)
    //         .post('/api/auth/login')
    //         .send({ username: 'userB', password: 'passwordB' });
    
    //     expect(loginResponseB.statusCode).toBe(200); // ログイン成功のステータスコード
    //     const tokenB = loginResponseB.body.token; // トークンを取得
    
    //     // ユーザーBとしてTodoリストを取得し、ユーザーAのTodoが見えないことを確認
    //     const getTodosResponseB = await request(app)
    //         .get('/api/todosj')
    //         .set('Authorization', `Bearer ${tokenB}`);
    
    //     expect(getTodosResponseB.statusCode).toBe(200);
    //     expect(Array.isArray(getTodosResponseB.body)).toBe(true);
    //     expect(getTodosResponseB.body.length).toBe(0); // ユーザーBにはユーザーAのTodoが見えないことを確認
    // });

});
