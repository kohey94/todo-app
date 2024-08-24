// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
}));

// 環境変数読み込み
require('dotenv').config();
//console.log(process.env.JWT_SECRET);

// MongoDB接続
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) { //接続されていなければ
    mongoose.connect('mongodb://localhost:27017/todo-app');
  }
};
connectDB();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("connected to MongoDB");
});

// ユーザー登録
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
    
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists"});
    }
    // PWハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ユーザー作成
    const user = new User({ username, password: hashedPassword });
    
    await user.save();
    
    // トークン生成
    const token = jwt.sign( { id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user: ', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ユーザーログイン
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // ログインできないとき
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h'});
    res.json({ token, username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Todoモデルの定義
const TodoSchema = new mongoose.Schema({
    name: String,
    completed: Boolean,
});

const Todo = mongoose.model('Todo', TodoSchema);

// APIルート
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error("Error! Fetching todos: ", error);
    res.status(500).json({message: "Server Error"});
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({
        name: req.body.name,
        completed: false,
    });
    await newTodo.save();
    res.json(newTodo);
  } catch (error) {
    console.error("Error! Creating new todo: ", error);
    res.status(500).json({message: "Server Error"});
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
  const updatedTodo = await Todo.findByIdAndUpdate(
    req.params.id,
    { completed: req.body.completed, name: req.body.name },
    { new: true } 
  );
  res.json(updatedTodo);
  } catch (error) {
    console.error("Error! Updating todo: ", error);
    res.status(500).json({message: "Server Error"});
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
  const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
  res.json(deletedTodo)
  } catch (error) {
    console.error("Error! Deleting todo: ", error);
    res.status(500).json({message: "Server Error"});
  }
});

app.listen(5000, () => {
    console.log('サーバー起動中 port 5000');
})

module.exports = app;