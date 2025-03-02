import React, { useEffect, useState } from 'react';
import './style.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ todo: '', completed: false });
  const [editingTodo, setEditingTodo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [nextId, setNextId] = useState(1);  // Start from ID 1 (or highest value if exists)

  // Fetch Todos from the API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('https://dummyjson.com/todos');
        const data = await response.json();
        setTodos(data.todos);

        // Find the highest ID from the todos and set nextId correctly
        if (data.todos.length > 0) {
          const highestId = Math.max(...data.todos.map(todo => todo.id)); // Get max ID
          setNextId(highestId + 1); // Set the next ID to highestId + 1
        }
      } catch (error) {
        console.error("Error fetching todos: ", error);
        alert("Failed to fetch todos. Please try again.");
      }
    };
    fetchTodos();
  }, []);

  // Handle new todo input change
  const handleNewTodoChange = (e) => {
    const { name, value } = e.target;
    setNewTodo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle create new todo
  const handleCreateTodo = async () => {
    if (newTodo.todo.trim()) {
      const newTodoData = {
        id: nextId, // Use the next available ID for the new todo
        todo: newTodo.todo,
        completed: false,
        userId: 5,
      };

      try {
        const response = await fetch('https://dummyjson.com/todos/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTodoData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const createdTodo = await response.json();

        // Even though the API might return an ID, we use our own ID to avoid duplication.
        setTodos((prevTodos) => [...prevTodos, { ...createdTodo, id: nextId }]);
        setNextId(prevId => prevId + 1); // Increment the next ID for future todos
        setNewTodo({ todo: '', completed: false });
        setSuccessMessage('Todo successfully added!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (error) {
        console.error('Error creating todo:', error);
        alert('Failed to create todo. Please try again.');
      }
    }
  };

  // Handle edit todo
  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
  };

  // Handle cancel editing todo
  const handleCancelEdit = () => {
    setEditingTodo(null); // Reset editing state to stop editing
  };

  // Handle updating todo (completing or uncompleting)
  const handleUpdateTodo = async () => {
    if (editingTodo) {
      const updatedTodo = {
        completed: !editingTodo.completed, // Toggle the completed status
        todo: editingTodo.todo, // Ensure we send the todo title if it's also being edited
      };

      try {
        const response = await fetch(`https://dummyjson.com/todos/${editingTodo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTodo),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        // The updatedTodoResponse should be returned directly if the PUT is successful
        const updatedTodoResponse = await response.json();

        // Update the todo list state with the updated todo
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === updatedTodoResponse.id ? updatedTodoResponse : todo))
        );

        // Reset editing state after update
        setEditingTodo(null);

        console.log('Todo updated successfully:', updatedTodoResponse);
      } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo. Please try again.');
      }
    }
  };

  // Handle deleting todo
  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`https://dummyjson.com/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // After successful deletion, filter out the todo from the state
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id)); 
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Todo List</h2>

      {/* Success Message */}
      {successMessage && <div className="success-message">{successMessage}</div>}

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

      {/* Todo List Table */}
      <table className="todo-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Todo</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo, index) => (
            <tr key={todo.id}>
              <td>{todo.id}</td>
              <td>
                {editingTodo?.id === todo.id ? (
                  <input
                    type="text"
                    value={editingTodo.todo}
                    onChange={(e) =>
                      setEditingTodo((prev) => ({ ...prev, todo: e.target.value }))
                    }
                  />
                ) : (
                  todo.todo
                )}
              </td>
              <td>
                {editingTodo?.id === todo.id ? (
                  <button onClick={handleUpdateTodo}>
                    {todo.completed ? 'Mark as Pending' : 'Mark as Completed'}
                  </button>
                ) : (
                  todo.completed ? 'Completed' : 'Pending'
                )}
              </td>
              <td>
                <button onClick={() => editingTodo?.id === todo.id ? handleCancelEdit() : handleEditTodo(todo)}>
                  {editingTodo?.id === todo.id ? 'Cancel' : 'Edit'}
                </button>
                {editingTodo?.id === todo.id && (
                  <button onClick={handleUpdateTodo}>Save</button>
                )}
                <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodoList;
