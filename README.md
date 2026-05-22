# 🚀 DevPulse Issue Tracker API

A secure and scalable Issue Tracking REST API built with Node.js, Express.js, TypeScript, PostgreSQL, JWT Authentication, and Raw SQL Queries.

This project supports authentication, role-based authorization, issue management, filtering, sorting, and secure CRUD operations.

---

# 🌐 Features

- ✅ User Authentication
- ✅ JWT Authorization
- ✅ Role-Based Access Control
- ✅ Protected Routes
- ✅ PostgreSQL Database
- ✅ Raw SQL Queries
- ✅ TypeScript Support
- ✅ Modular Express Architecture
- ✅ Sorting & Filtering Support

---

# 🛠️ Technology Stack

| Technology | Description |
|------------|-------------|
| Node.js | JavaScript Runtime |
| TypeScript | Strongly Typed JavaScript |
| Express.js | Backend Framework |
| PostgreSQL | Relational Database |
| pg | PostgreSQL Native Driver |
| bcrypt | Password Hashing |
| jsonwebtoken | JWT Authentication |

---

# 👥 User Roles

## 🔹 Contributor

- Register/Login
- Create Issues
- View All Issues
- Update Own Issue (only if status is `open`)

## 🔹 Maintainer

- All Contributor Permissions
- Update Any Issue
- Delete Any Issue
- Manage Workflow Status
- Access Internal Metrics

---

# 📁 Project Structure

```bash
src/
│
├── app.ts
├── server.ts
│
├── db/
│   └── index.ts
│
├── middleware/
│   └── auth.middleware.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── auth.interface.ts
│   │
│   └── issues/
│       ├── issue.controller.ts
│       ├── issue.routes.ts
│       └── issue.service.ts
│
├── types/
│   └── express.d.ts
│
└── database/
    └── schema.sql
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone <repository-url>
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/devpulse

JWT_SECRET=SUPER_SECRET_KEY
```

---

# 🗄️ Database Setup

## Create Database

```sql
CREATE DATABASE devpulse;
```

---

## Run Schema File

```bash
psql -U postgres -d devpulse -f src/database/schema.sql
```

---

# ▶️ Run Project

## Development Server

```bash
npm run dev
```

---

## Production Build

```bash
npm run build
```

---

## Start Production Server

```bash
npm start
```

---

# 🔐 Authentication Flow

Client Login/Register  
⬇  
Password Hashing with bcrypt  
⬇  
JWT Token Generate  
⬇  
Client Sends Token in Authorization Header  
⬇  
Server Verifies JWT  
⬇  
Protected Route Access

---

# 📌 API Endpoints

# 🔹 Authentication

## Register User

### POST `/api/auth/signup`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "contributor"
}
```

---

## Login User

### POST `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

---

# 🔹 Issues

## Create Issue

### POST `/api/issues`

### Headers

```bash
Authorization: <JWT_TOKEN>
```

### Body

```json
{
  "title": "Database timeout issue",
  "description": "Pool exhausted after concurrent requests",
  "type": "bug"
}
```

---

## Get All Issues

### GET `/api/issues`

### Query Params

| Query | Values |
|------|---------|
| sort | newest / oldest |
| type | bug / feature_request |
| status | open / in_progress / resolved |

### Example

```bash
/api/issues?sort=newest&type=bug
```

---

## Get Single Issue

### GET `/api/issues/:id`

### Example

```bash
/api/issues/1
```

---

## Update Issue

### PATCH `/api/issues/:id`

### Headers

```bash
Authorization: <JWT_TOKEN>
```

### Body

```json
{
  "title": "Updated Issue Title",
  "description": "Updated description",
  "type": "bug"
}
```

---

## Delete Issue

### DELETE `/api/issues/:id`

### Headers

```bash
Authorization: <JWT_TOKEN>
```

---

# 🔒 Authorization Rules

| Action | Contributor | Maintainer |
|--------|-------------|-------------|
| Create Issue | ✅ | ✅ |
| View Issues | ✅ | ✅ |
| Update Own Open Issue | ✅ | ✅ |
| Update Any Issue | ❌ | ✅ |
| Delete Issue | ❌ | ✅ |

---

# 🧪 Testing Tools

You can test the API using:

- Postman
- Thunder Client
- Insomnia

---

# 🔥 Future Improvements

- Input Validation
- Refresh Token System
- Pagination
- Search Functionality
- Rate Limiting
- Logging System
- Docker Support
- Unit Testing

---

# 👨‍💻 Developer

## Abu Solayman Sefat

Backend Developer | MERN Stack Developer

---

# 📄 License

This project is licensed under the MIT License.