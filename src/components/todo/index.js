import React, { useEffect, useState } from "react";
import "./style.css";

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
      try {
        const response = await fetch("https://dummyjson.com/todos");
        const data = await response.json();
        setTodos(data.todos);
        const highestId = Math.max(...data.todos.map((todo) => todo.id), 0);
        setNextId(highestId + 1);
      } catch (error) {
        console.error("Error fetching todos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  // Handle new todo input change
  const handleNewTodoChange = (e) => {
    const { name, value } = e.target;
    setNewTodo((prev) => ({ ...prev, [name]: value }));
  };

  // Create new Todo
  const handleCreateTodo = async () => {
    if (newTodo.todo.trim()) {
      const newTodoData = { ...newTodo, id: nextId, userId: 5 };

      try {
        const response = await fetch("https://dummyjson.com/todos/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTodoData),
        });
        const createdTodo = await response.json();
        setTodos((prev) => [...prev, { ...createdTodo, id: nextId }]);
        setNextId((prev) => prev + 1);
        setNewTodo({ todo: "", completed: null });
      } catch (error) {
        console.error("Error creating todo:", error);
      }
    }
  };

  // Handle status update after drag and drop
  const handleDrop = (status, e) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");
    const updatedTodos = [...todos];
    const draggedTodo = updatedTodos.find((todo) => todo.id === parseInt(todoId));

    if (draggedTodo) {
      if (status === "Completed") {
        draggedTodo.completed = true;
      } else if (status === "In Progress") {
        draggedTodo.completed = null; // If it's in progress, set completed to null
      } else if (status === "Pending") {
        draggedTodo.completed = false;
      }

      setTodos(updatedTodos);
      updateTodoStatus(draggedTodo);
    }
  };

  // Update todo status via API
  const updateTodoStatus = async (todo) => {
    try {
      const response = await fetch(`https://dummyjson.com/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: todo.completed, todo: todo.todo }),
      });
      await response.json();
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  // Handle drag start
  const handleDragStart = (e, todo) => {
    e.dataTransfer.setData("todoId", todo.id); // Transfer todoId on drag
  };

  // Edit Todo
  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  // Save Updated Todo
  const handleSaveEdit = async (todoId) => {
    if (editingTodo && editingTodo.todo.trim()) {
      const updatedTodo = { ...editingTodo };
  
      try {
        // Log to check the data being sent
        console.log("Updating todo with ID:", todoId);
        console.log("Updated todo:", updatedTodo);
  
        // Make PUT request to update the todo on the backend
        const response = await fetch(`https://dummyjson.com/todos/${todoId}`, {
          method: "PUT", // Use PUT to update the todo
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completed: updatedTodo.completed, // update the completed status
            todo: updatedTodo.todo, // update the todo text
          }),
        });
  
        if (response.ok) {
          const updatedData = await response.json();
  
          // Update the local state with the updated todo
          setTodos((prevTodos) =>
            prevTodos.map((todo) => (todo.id === updatedData.id ? updatedData : todo))
          );
          setEditingTodo(null); // Close the editing mode after saving
        } else {
          console.error("Failed to update the todo:", response.statusText);
        }
      } catch (error) {
        console.error("Error saving todo:", error);
      }
    }
  };
  

  return (
    <div className="kanban-container">
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
      {
        loading ? <div className="kanban-lane loader">Loading...</div> :
     
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
                    {/* Editable Todo */}
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
                        <button onClick={()=>handleSaveEdit(todo.id)}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <span>{todo.todo}</span>
                        <button onClick={() => handleEditTodo(todo)}>Edit</button>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}

      </div>
 }
    </div>
  );
};

export default TodoList;
