const express = require('express');
const Todo = require('../models/Todo');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();
const router = express.Router();

router.use(authMiddleware);

// todo取得
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id });
        res.json(todos);
    } catch (error) {
        console.error("Error! Fetching todos: ", error.message);
        res.status(500).json({message: "Server Error"});
    }
});

// todo作成  
router.post('/', async (req, res) => {
    try {
        const newTodo = new Todo({
            name: req.body.name,
            completed: false,
            userId: req.user._id
        });
        await newTodo.save();
        res.json(newTodo);
    } catch (error) {
        console.error("Error! Creating new todo: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

// todo更新
router.put('/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            { _id:req.params.id, userId: req.user._id},
            { completed: req.body.completed, name: req.body.name },
            { new: true } 
        );
        res.json(updatedTodo);
    } catch (error) {
        console.error("Error! Updating todo: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

// todo削除
router.delete('/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json(deletedTodo)
    } catch (error) {
        console.error("Error! Deleting todo: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

module.exports = router;