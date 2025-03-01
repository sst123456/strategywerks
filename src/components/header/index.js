// src/components/Header.js
import React, { useState } from 'react';
import './style.css';

const Header = ({ onAddTodo }) => {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleAddClick = () => {
    if (inputText.trim()) {
      onAddTodo(inputText);
      setInputText('');
    }
  };

  return (
    <header className="todo-header">
      <div className="card">
        <h1 className="title">Todo Board</h1>
        <div className="header-actions">
          <input
            type="text"
            className="todo-input"
            placeholder="Add a new task"
            value={inputText}
            onChange={handleInputChange}
          />
          <button className="add-btn" onClick={handleAddClick}>Add</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
