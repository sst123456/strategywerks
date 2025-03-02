import React, { useEffect, useState } from "react";
import "./style.css";

// Utility function to fetch todos
const fetchTodosFromApi = async () => {
  try {
    const response = await fetch("https://dummyjson.com/todos");
    const data = await response.json();
    return data.todos || [];
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
};

// Utility function to make a PUT request for updating a todo
const updateTodoInApi = async (todo) => {
  try {
    const response = await fetch(`https://dummyjson.com/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: todo.completed, todo: todo.todo }),
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error("Error updating todo status:", error);
    return null;
  }
};

// Utility function to create a new todo
const createTodoInApi = async (newTodo) => {
  try {
    const response = await fetch("https://dummyjson.com/todos/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error("Error creating todo:", error);
    return null;
  }
};

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ todo: "", completed: null });
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // Fetch Todos from the API
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      const todos = await fetchTodosFromApi();
      setTodos(todos);
      setNextId(Math.max(...todos.map((todo) => todo.id), 0) + 1);
      setLoading(false);
    };
    fetchTodos();
  }, []);

  const handleNewTodoChange = (e) => {
    const { name, value } = e.target;
    setNewTodo((prev) => ({ ...prev, [name]: value }));
  };

  // Create new Todo
  const handleCreateTodo = async () => {
    if (newTodo.todo.trim()) {
      const newTodoData = { ...newTodo, id: nextId, userId: 5 };
      const createdTodo = await createTodoInApi(newTodoData);

      if (createdTodo) {
        setTodos((prev) => [...prev, createdTodo]);
        setNextId((prev) => prev + 1);
        setNewTodo({ todo: "", completed: null });
      }
    }
  };

  const handleDrop = (status, e) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");
    const updatedTodos = [...todos];
    const draggedTodo = updatedTodos.find((todo) => todo.id === parseInt(todoId));

    if (draggedTodo) {
      draggedTodo.completed = status === "Completed" ? true : status === "In Progress" ? null : false;
      setTodos(updatedTodos);
      updateTodoStatus(draggedTodo);
    }
  };

  const updateTodoStatus = async (todo) => {
    const updatedTodo = await updateTodoInApi(todo);
    if (updatedTodo) {
      setTodos((prevTodos) => prevTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
    }
  };

  const handleDragStart = (e, todo) => {
    e.dataTransfer.setData("todoId", todo.id);
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const handleSaveEdit = async () => {
    if (editingTodo && editingTodo.todo.trim()) {
      const updatedTodo = await updateTodoInApi(editingTodo);
      if (updatedTodo) {
        setTodos((prevTodos) => prevTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
        setEditingTodo(null);
      }
    }
  };

  return (
    <div className="container">
      <h2>Todo Board</h2>

      {/* New Todo Form */}
      <div className="new-todo-form">
        <input
          type="text"
          name="todo"
          placeholder="Todo Title"
          value={newTodo.todo}
          onChange={handleNewTodoChange}
        />
        <button onClick={handleCreateTodo}>Create Todo</button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="kanban-lane loader">Loading...</div>
      ) : (
        <div className="kanban-board">
          {["Pending", "In Progress", "Completed"].map((status) => (
            <div
              key={status}
              className="kanban-lane"
              onDrop={(e) => handleDrop(status, e)}
              onDragOver={(e) => e.preventDefault()}
            >
              <h3>{status}</h3>
              <div className="todo-list">
                {todos
                  .filter((todo) => {
                    if (status === "Pending") return todo.completed === false;
                    if (status === "In Progress") return todo.completed === null;
                    return todo.completed === true;
                  })
                  .map((todo) => (
                    <div
                      key={todo.id}
                      className="todo-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, todo)}
                    >
                      {editingTodo?.id === todo.id ? (
                        <div>
                          <input
                            type="text"
                            value={editingTodo.todo}
                            onChange={(e) =>
                              setEditingTodo({
                                ...editingTodo,
                                todo: e.target.value,
                              })
                            }
                          />
                          <div className="button-wrapper">
                          <button onClick={handleSaveEdit}>Save</button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span>{todo.todo}</span>
                          <div className="button-wrapper">
                          <button onClick={() => handleEditTodo(todo)}>Edit</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
