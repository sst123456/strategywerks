import React, { useEffect, useState } from 'react';
import './style.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ todo: '', completed: false, userId: 5 });
  const [editingTodo, setEditingTodo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch Todos from the API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('https://dummyjson.com/todos');
        const data = await response.json();
        setTodos(data.todos);
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
          const errorData = await response.json();
          console.error('Error:', errorData);
          throw new Error('Error creating todo');
        }

        const createdTodo = await response.json();
        setTodos((prevTodos) => [...prevTodos, createdTodo]);
        setNewTodo({ todo: '', completed: false, userId: 5 }); // Reset input
        setSuccessMessage('Todo successfully added!');
        setTimeout(() => setSuccessMessage(''), 4000); // Show success message for 4 seconds
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
          method: 'PUT', // Or PATCH
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTodo),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error:', errorData);
          throw new Error('Error updating todo');
        }

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

      const deletedTodo = await response.json();
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== deletedTodo.id)); // Remove deleted todo from state
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index);
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData('dragIndex');
    const draggedTodo = todos[dragIndex];
    const updatedTodos = [...todos];
    updatedTodos.splice(dragIndex, 1);
    updatedTodos.splice(dropIndex, 0, draggedTodo);
    setTodos(updatedTodos);
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
            <tr
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={(e) => e.preventDefault()}
            >
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
