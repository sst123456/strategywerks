import React, { useEffect, useState } from "react";
import "./style.css";
import { apiRequest } from "../../utils/apiRequest";

// Fetch Todos from API
const fetchTodosFromApi = async () => {
  const data = await apiRequest("https://dummyjson.com/todos");
  return Array.isArray(data?.todos) ? data.todos : []; 
};

// Create Todo in API
const createTodoInApi = async (newTodo) => {
  const response = await fetch("https://dummyjson.com/todos/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  });
  const createdTodo = await response.json();
  return createdTodo; 
};

// Delete Todo from API
const deleteTodoInApi = async (id) => {
  const response = await fetch(`https://dummyjson.com/todos/${id}`, { method: "DELETE" });
  return response.ok;
};

// TodoList Component
const TodoList = () => {
  const [todos, setTodos] = useState([]); 
  const [newTodo, setNewTodo] = useState({ todo: "", completed: null });
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // Fetch Todos from the API
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      const todos = await fetchTodosFromApi(); 
      setTodos(todos); 
      setLoading(false);
    };
    fetchTodos();
  }, []);

  // Handle input change for new todo
  const handleNewTodoChange = (e) => {
    const { name, value } = e.target;
    setNewTodo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle creating a new Todo (with unique ID assigned locally)
  const handleCreateTodo = async () => {
    if (newTodo.todo.trim()) {
      const newTodoWithId = {
        ...newTodo,
        id: Date.now(), // Assigning unique ID based on current timestamp
        isNew: true, // Mark it as a new todo
      };

      setTodos((prev) => [...prev, newTodoWithId]); // Update the state immediately

      // Optionally, simulate an API call to add the new todo
      await createTodoInApi(newTodoWithId);
      setNewTodo({ todo: "", completed: null }); // Reset the form
    }
  };

  // Handle deleting a Todo
  const handleDeleteTodo = async (id) => {
    const todoToDelete = todos.find((todo) => todo.id === id);
        if (todoToDelete.isNew) {
      setTodos(todos.filter((todo) => todo.id !== id)); // Remove from local state
      console.log("Deleted local todo successfully");
    } else {
      // If it's a fetched todo, call the API to delete it
      const isDeleted = await deleteTodoInApi(id);
      if (isDeleted) {
        setTodos(todos.filter((todo) => todo.id !== id)); // Remove from state
        console.log("Todo deleted successfully");
      } else {
        console.error("Failed to delete todo with id:", id);
      }
    }
  };

  // Handle editing a Todo
  const handleEditTodo = (todo) => setEditingTodo(todo);

  const handleCancelEdit = () => setEditingTodo(null);

  const handleSaveEdit = async () => {
    if (editingTodo && editingTodo.todo.trim()) {
      const updatedTodo = editingTodo;
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      setEditingTodo(null);
    }
  };

  // Drag and drop handlers
  const handleDrop = (status, e) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");
    const updatedTodos = [...todos];
    const draggedTodo = updatedTodos.find((todo) => todo.id === parseInt(todoId));

    if (draggedTodo) {
      draggedTodo.completed = status === "Completed" ? true : status === "In Progress" ? null : false;
      setTodos(updatedTodos);
    }
  };

  const handleDragStart = (e, todo) => {
    e.dataTransfer.setData("todoId", todo.id);
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
        <button onClick={handleCreateTodo}>&#128221; Create Todo</button>
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
                        <>
                          <input
                            type="text"
                            value={editingTodo.todo}
                            onChange={(e) =>
                              setEditingTodo({ ...editingTodo, todo: e.target.value })
                            }
                          />
                          <button onClick={handleCancelEdit}>❌ Cancel</button>
                          <button onClick={handleSaveEdit}>💾 Save</button>
                        </>
                      ) : (
                        <>
                          {todo.todo}
                          <div className="action-btns">
                            <button onClick={() => handleEditTodo(todo)} className="action-btn">✏️</button>
                            <button onClick={() => handleDeleteTodo(todo.id)} className="action-btn">🗑️</button>
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
