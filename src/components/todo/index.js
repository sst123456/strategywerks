import React, { useEffect, useState } from 'react';
import './style.css';
import { apiCall } from '../../utils/apiCall';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ todo: '', completed: false });
  const [editingTodo, setEditingTodo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch Todos from the API
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      const data = await apiCall('https://dummyjson.com/todos');
      if (data && data.todos) {
        setTodos(data.todos);
        const highestId = Math.max(...data.todos.map(todo => todo.id));
        setNextId(highestId + 1);
      }
      setLoading(false);
    };
    fetchTodos();
  }, []);

  // Handle new todo input change
  const handleNewTodoChange = (e) => {
    const { name, value } = e.target;
    setNewTodo(prev => ({ ...prev, [name]: value }));
  };

  // Create new Todo
  const handleCreateTodo = async () => {
    if (newTodo.todo.trim()) {
      const newTodoData = { ...newTodo, id: nextId, userId: 5 };

      const createdTodo = await apiCall('https://dummyjson.com/todos/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodoData),
      });

      if (createdTodo) {
        setTodos(prev => [...prev, { ...createdTodo, id: nextId }]);
        setNextId(prev => prev + 1);
        setNewTodo({ todo: '', completed: false });
        setSuccessMessage('Todo successfully added!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    }
  };

  // Handle edit todo
  const handleEditTodo = (todo) => setEditingTodo(todo);
  const handleCancelEdit = () => setEditingTodo(null);

  // Update Todo
  const handleUpdateTodo = async () => {
    if (editingTodo) {
      const updatedTodo = { completed: !editingTodo.completed, todo: editingTodo.todo };
      const updatedTodoResponse = await apiCall(
        `https://dummyjson.com/todos/${editingTodo.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTodo),
        }
      );
      if (updatedTodoResponse) {
        setTodos(prevTodos =>
          prevTodos.map(todo => (todo.id === updatedTodoResponse.id ? updatedTodoResponse : todo))
        );
        setEditingTodo(null);
      }
    }
  };

  // Handle delete todo
  const handleDeleteTodo = async (id) => {
    const response = await apiCall(`https://dummyjson.com/todos/${id}`, 
     { method: 'DELETE' });
    if (response) setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  // Handle drag and drop logic
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('draggedTodoIndex', index);
  };
  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData('draggedTodoIndex');
    const draggedTodo = todos[dragIndex];
    const updatedTodos = [...todos];
    updatedTodos.splice(dragIndex, 1);
    updatedTodos.splice(dropIndex, 0, draggedTodo);
    setTodos(updatedTodos);
  };
  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="container">
      <h2>Todo Board</h2>

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

      <div className="list-wrapper">
        {loading && <div className="loader">Loading...</div>}

        {/* Todo List Table */}
        {todos.length > 0 && (
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
                  onDragOver={handleDragOver}
                  className={editingTodo?.id === todo.id ? 'editing' : ''}
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
                    <button
                      onClick={() => editingTodo?.id === todo.id ? handleCancelEdit() : handleEditTodo(todo)}
                    >
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
        )}
      </div>
    </div>
  );
};

export default TodoList;
