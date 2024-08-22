import React, { useState, useEffect } from "react";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Todo from "./components/Todo";
import { nanoid } from "nanoid";

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All"); 
  
  useEffect(() => {
    fetch("http://localhost:5000/api/todos")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch tasks:", error);
      });
  }, []);
  

  function addTask(name) {
    fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => {
        if (!response.ok) {
          // エラーの場合
          return response.json().then((error) => {
            throw new Error(error.message);
          })
        }
        return response.json()})
      .then((newTask) => setTasks([...tasks, newTask]))
      .catch((error) => {
        console.error("Error adding task:", error);
        alert("Failed to add task: " + error.message);
      });
  }

  function toggleTaskCompleted(id) {
    const task = tasks.find((task) => task._id === id);
    fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: !task.completed, name: task.name }),
    })
      .then((response) => response.json())
      .then((updatedTask) => 
        setTasks(
          tasks.map((task) => (task._id === id ? updatedTask : task))
      )
    );
  }
  
  function deleteTask(id) {
    fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "DELETE",
    }).then(() => 
      setTasks(tasks.filter((task) => task._id !== id))
    );
  }

  function editTask(id, newName) {
    fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: false, name: newName }),
    })
      .then((response) => response.json())
      .then((updatedTask) => 
        setTasks(
          tasks.map((task) => (task._id === id ? updatedTask : task))
      )
    );
  }

  const taskList = tasks
    .filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo 
        id={task._id}
        name={task.name}
        completed={task.completed}
        key={task._id}
        toggleTaskCompleted={toggleTaskCompleted}
        deleteTask={deleteTask}
        editTask={editTask}
      />
  ));

  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton 
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  const tasksNoun = taskList.length !== 1 ? "tasks" : "task";
  const headingText = `${taskList.length} ${tasksNoun} remaining`;
  console.log(tasks);
  
  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask}/>
      <div className="filters btn-group stack-exception">
        {filterList}
      </div>
      <h2 id="list-heading">{headingText}</h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {taskList}
      </ul>
    </div>
  );
}

export default App;
