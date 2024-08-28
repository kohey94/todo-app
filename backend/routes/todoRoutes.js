const express = require('express');
const Todo = require('../models/Todo');

const router = express.Router();

// todo取得
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        console.error("Error! Fetching todos: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

// todo作成  
router.post('/', async (req, res) => {
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

// todo更新
router.put('/:id', async (req, res) => {
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

// todo削除
router.delete('/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        res.json(deletedTodo)
    } catch (error) {
        console.error("Error! Deleting todo: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

module.exports = router;