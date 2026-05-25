# 🚀 Smart Task Management System

A full-stack MERN application for intelligent task management with real-time updates, analytics, and a beautiful responsive UI.

---

## ✨ Features

### Authentication
- User signup & login with JWT
- Protected routes
- Password reset via email
- bcrypt password hashing

### Task Management
- Create, edit, delete tasks
- Mark complete / reopen
- **Drag & drop** reordering (dnd-kit)
- Priority: Urgent / High / Medium / Low
- Status: Pending / In Progress / Completed
- Due dates, categories, tags
- Notes & file attachments (Cloudinary)
- Search, filter, paginate

### Dashboard
- Total / completed / pending stats
- Productivity charts (Recharts)
- Weekly activity area chart
- Priority pie chart
- Recent & upcoming tasks

### Profile
- Update name
- Upload profile picture (Cloudinary)
- Change password

### Admin
- View & search all users
- Activate / deactivate users
- Delete users
- System analytics & charts

### UI/UX
- Dark / light mode toggle
- Fully responsive (mobile-first)
- Sidebar navigation
- Toast notifications (react-hot-toast)
- Loading skeletons
- Framer Motion animations
- Calendar view

### Additional
- Real-time updates (Socket.IO)
- Email notifications (Nodemailer)
- Activity logs
- Rate limiting, Helmet security

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Context API + useReducer |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Charts | Recharts |
| Drag & Drop | dnd-kit |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| File Upload | Multer + Cloudinary |
| Real-time | Socket.IO |
| Email | Nodemailer |

---

## 📁 Project Structure

```
smart-task-manager/
├── backend/
│   ├── config/cloudinary.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/emailService.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── layouts/
        ├── pages/
        ├── services/
        └── utils/
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Gmail account (for email)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-task-manager
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:5173
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🌐 Deployment

### Frontend → Netlify

1. Push `frontend/` to GitHub
2. Connect repo to [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables:
   - `VITE_API_URL` = your Render backend URL + `/api`
   - `VITE_SOCKET_URL` = your Render backend URL
6. The included `netlify.toml` handles SPA redirects automatically

### Backend → Render

1. Push `backend/` to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from `.env.example`
6. Set `NODE_ENV=production`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get tasks (filter/search/paginate) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PUT | `/api/tasks/reorder` | Reorder tasks |
| GET | `/api/tasks/dashboard` | Dashboard stats |
| GET | `/api/tasks/categories` | Get categories |
| POST | `/api/tasks/:id/notes` | Add note |
| DELETE | `/api/tasks/:id/notes/:noteId` | Delete note |
| POST | `/api/tasks/:id/attachments` | Upload attachment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/avatar` | Upload avatar |
| PUT | `/api/users/change-password` | Change password |
| DELETE | `/api/users/me` | Delete account |

### Admin (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get user details |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id/toggle-status` | Toggle active |
| GET | `/api/admin/analytics` | System analytics |

---

## 🔧 MongoDB Schemas

### User
```js
{ name, email, password(hashed), avatar{public_id,url},
  role(user|admin), isActive, lastLogin, preferences{theme,notifications} }
```

### Task
```js
{ title, description, status, priority, category, tags[],
  dueDate, completedAt, order, user(ref), notes[], attachments[], isArchived }
```

### Activity
```js
{ user(ref), action, description, metadata, taskId(ref) }
```

---

## 🔒 Security Features

- Helmet.js HTTP headers
- Rate limiting (100 req / 15 min)
- JWT token expiry
- bcrypt password hashing (salt rounds: 12)
- Input validation (express-validator)
- CORS whitelist
- Environment variables for all secrets

---

## 📄 License

MIT © 2025 Smart Task Manager
