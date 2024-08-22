// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
}));

// MongoDB接続
mongoose.connect('mongodb://localhost:27017/todo-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("connected to MongoDB");
})

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