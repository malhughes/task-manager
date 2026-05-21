# Task Manager

A full-stack task management application with a Kanban board interface, drag-and-drop support, and JWT-based authentication.

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (via cookies)
- Cloudinary (for media uploads)

**Frontend**
- React 18 + Vite
- Material UI (MUI)
- React DnD (drag-and-drop, with touch support)
- React Router v6

## Features

- User signup, login, and logout with JWT cookie auth
- Personal Kanban board with three swimlanes: **To Do**, **In Progress**, **Completed**
- Drag-and-drop tasks between columns (mouse and touch)
- Create, edit, and delete tasks with title, description, and priority
- Toast notifications and keyboard shortcuts
- Responsive layout (mobile and desktop)
- Frontend served from the backend in production

## Project Structure

```
task-manager/
├── backend/
│   ├── controllers/      # Auth, user, and task controllers
│   ├── middleware/        # JWT route protection
│   ├── models/            # Mongoose schemas (User, Task)
│   ├── routes/            # Express routers
│   ├── db/                # MongoDB connection
│   ├── lib/               # Token utilities
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # KanbanBoard, TaskCard, Swimlane, modals, etc.
│   │   ├── pages/         # Dashboard, Login, Signup, 404
│   │   ├── contexts/      # AuthContext
│   │   ├── hooks/         # Toast, keyboard shortcuts, focus management
│   │   └── services/      # API calls (auth, tasks)
│   └── index.html
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account (optional, for image uploads)

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173   # for CORS in development
```

### Development

Install backend dependencies and start the dev server:

```bash
npm install
npm run dev
```

In a separate terminal, start the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

### Production Build

```bash
npm run build   # installs frontend deps and builds the Vite bundle
npm start       # serves API + frontend from Express on PORT
```

## API Endpoints

All task routes require authentication (JWT cookie).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/tasks` | List all tasks for the user |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/status` | Update task status (drag-and-drop) |
| DELETE | `/api/tasks/:id` | Delete a task |

## Task Schema

| Field | Type | Values |
|-------|------|--------|
| `title` | String (required) | max 200 chars |
| `description` | String | max 1000 chars |
| `status` | String | `todo` · `in-progress` · `completed` |
| `priority` | String | `low` · `medium` · `high` |
| `assignee` | ObjectId | references User |

## Running Tests

Backend tests:

```bash
npm test
```

Frontend tests:

```bash
cd frontend && npm test
```
