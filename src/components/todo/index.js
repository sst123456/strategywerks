import React, { useEffect, useState } from 'react';
import './style.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ todo: '', completed: false, userId: 5 });
  const [editingTodo, setEditingTodo] = useState(null);

  // Fetch Todos from the API
  useEffect(() => {
    const fetchTodos = async () => {
      const response = await fetch('https://dummyjson.com/todos');
      const data = await response.json();
      setTodos(data.todos);
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
        todo: newTodo.todo,
        completed: false,
        userId: newTodo.userId,
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
        setTodos([...todos, createdTodo]);
        setNewTodo({ todo: '', completed: false, userId: 5 }); // Reset input
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

  // Handle updating todo (completing or uncompleting)
  const handleUpdateTodo = async () => {
    if (editingTodo) {
      const updatedTodo = {
        completed: !editingTodo.completed,
      };

      try {
        const response = await fetch(`https://dummyjson.com/todos/${editingTodo.id}`, {
          method: 'PUT', // or PATCH
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTodo),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const updatedTodoResponse = await response.json();
        setTodos(todos.map((todo) => (todo.id === updatedTodoResponse.id ? updatedTodoResponse : todo)));
        setEditingTodo(null); // Close the editing view
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

      const deletedTodo = await response.json();
      setTodos(todos.filter((todo) => todo.id !== deletedTodo.id)); // Remove deleted todo from state
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Todo List</h2>

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
          {todos.map((todo) => (
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
              <td>{todo.completed ? 'Completed' : 'Pending'}</td>
              <td>
                <button onClick={() => handleUpdateTodo()}>
                  {todo.completed ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
                <button onClick={() => handleEditTodo(todo)}>
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
