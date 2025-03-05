# Todo Board

A simple and interactive Todo Board application built using React. This app allows users to create, update, delete, and organize tasks in a kanban-style board. It also supports drag-and-drop functionality to change the status of tasks between different categories (e.g., "Pending," "In Progress," and "Completed").

---

## Features

- **Create Todos**: Add new tasks with a title.
- **Edit Todos**: Edit the content of a task.
- **Delete Todos**: Remove tasks either locally or from the API.
- **Drag and Drop**: Move tasks between different categories: "Pending," "In Progress," and "Completed."
- **API Integration**: The app interacts with a dummy API for persisting tasks, allowing tasks to be fetched, created, and deleted from a backend.

---

## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **CSS**: Styling the app for a basic but responsive layout.
- **Fetch API**: Interacting with a dummy JSON API to create, fetch, update, and delete tasks.
- **Local State Management**: Using React's `useState` and `useEffect` hooks for managing the application's state.

---

## Installation

To run the project locally, follow these steps:

### Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)

### Steps

1. **Clone the repository**:

git clone https://github.com/your-username/todo-board.git
cd todo-board

 --- 

### Install dependencies:
npm install

--

### Start the development server:
npm start

Open your browser and go to http://localhost:3000 to see the application in action.

---
## How It Works
Fetching Todos: On initial load, the app fetches a list of todos from a dummy JSON API (https://dummyjson.com/todos).

--

## Creating Todos:

Users can create new todos by typing a title and clicking the "Create Todo" button.
A unique ID is assigned to each new todo based on the current timestamp.
The new todo is added to the backend API and updated in the local state.
Editing Todos:

Users can click on the "Edit" button next to a todo item, which will show an input field to modify the todo's title.
Changes are updated in the local state, and users can cancel or save the changes.
Deleting Todos:

Users can delete tasks either locally (if newly created) or by calling the API (for todos fetched from the backend).
Drag and Drop:

Tasks can be dragged between columns labeled "Pending," "In Progress," and "Completed."
The task's completion status is updated when it is dropped in a new column.

--

## API Endpoints
This app interacts with the following endpoints:

1. Fetch Todos: GET https://dummyjson.com/todos
2. Create Todo: POST https://dummyjson.com/todos/add
3. Update Todo: PUT https://dummyjson.com/todos/{id}
4. Delete Todo: DELETE https://dummyjson.com/todos/{id}

### Folder Structure

src/
├── App.js                # Main component to render the todo board
├── components/todo       # Contains all logic related to todo management      
└── index.js              # Entry point for React app
└── utils / apiRequest    # For API call