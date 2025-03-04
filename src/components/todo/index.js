import React, { useEffect, useState } from "react";
import "./style.css";
import { apiRequest } from "../../utils/apiRequest";

// Fetch Todos from API
const fetchTodosFromApi = async () => {
  const data = await apiRequest("https://dummyjson.com/todos");
  return Array.isArray(data?.todos) ? data.todos : []; // Ensure it returns an array
};

// Create Todo in API
const createTodoInApi = async (newTodo) => {
  const response = await fetch("https://dummyjson.com/todos/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  });
  const createdTodo = await response.json();
  return createdTodo; // Ensure it returns the created todo with the ID
};

// Update Todo in API with the provided fetch method
const updateTodoInApi = async (todo) => {
  const response = await fetch(`https://dummyjson.com/todos/${todo.id}`, {
    method: "PUT", // or PATCH
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      completed: todo.completed, // update the completed status
      todo: todo.todo, // keep the todo text as it is
    }),
  });
  const updatedTodo = await response.json();
  return updatedTodo;
};

// Delete Todo from API
const deleteTodoInApi = async (id) => {
  const response = await fetch(`https://dummyjson.com/todos/${id}`, {
    method: "DELETE",
  });
  console.log(response);  // Log the response
  return response.ok;
};

const TodoList = () => {
  const [todos, setTodos] = useState([]); // Initialize todos as an empty array
  const [newTodo, setNewTodo] = useState({ todo: "", completed: null });
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // Fetch Todos from the API
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      const todos = await fetchTodosFromApi(); // Ensure it is always an array
      setTodos(todos); // This should now always be an array
      setLoading(false);
    };
    fetchTodos();
  }, []);

  const handleNewTodoChange = (e) => {
    const { name, value } = e.target;
    setNewTodo((prev) => ({ ...prev, [name]: value }));
  };

  // Create new Todo and rely on backend for the ID
  const handleCreateTodo = async () => {
    if (newTodo.todo.trim()) {
      const createdTodo = await createTodoInApi({
        ...newTodo,
        userId: 30,
      });

      if (createdTodo && createdTodo.id) {
        setTodos((prev) => [...prev, createdTodo]); // Add the created todo to state
        setNewTodo({ todo: "", completed: null }); // Reset the new todo form
      } else {
        console.error("Failed to create todo: No ID returned from API");
      }
    }
  };

  // Handle deleting a todo task
  const handleDeleteTodo = async (id) => {
    console.log(`Attempting to delete todo with id: ${id}`);  // Log the ID
    const isDeleted = await deleteTodoInApi(id);
    if (isDeleted) {
      setTodos(todos.filter((todo) => todo.id !== id)); // Remove deleted todo from the state
    } else {
      console.error("Failed to delete todo");
    }
  }; 

  const handleDrop = (status, e) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");
    const updatedTodos = [...todos];
    const draggedTodo = updatedTodos.find((todo) => todo.id === parseInt(todoId));

    if (draggedTodo) {
      draggedTodo.completed =
        status === "Completed" ? true : status === "In Progress" ? null : false;
      setTodos(updatedTodos);
      updateTodoStatus(draggedTodo);
    }
  };

  const updateTodoStatus = async (todo) => {
    const updatedTodo = await updateTodoInApi(todo);
    if (updatedTodo) {
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
      );
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
        // Update the todo in the local state
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
        );
        setEditingTodo(null); // Reset editing state
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
                              setEditingTodo({
                                ...editingTodo,
                                todo: e.target.value,
                              })
                            }
                          />
                          <div className="button-wrapper">
                            <button onClick={handleCancelEdit}>❌ Cancel</button>
                            <button onClick={handleSaveEdit}>💾 Save</button>
                          </div>
                        </>
                      ) : (
                        <>
                          {todo.todo}
                          <div className="action-btns">
                            <span onClick={() => handleEditTodo(todo)} className="action-btn">
                              ✏️
                            </span>
                            <span onClick={() => handleDeleteTodo(todo.id)} className="action-btn">
                              🗑️
                            </span>
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
