# DevPulse - Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## 🚀 Live Server

**Backend API:** https://assingment-02.vercel.app/

## 📖 Project Overview

DevPulse is an issue tracking system where team members can:

* Register and log in securely
* Report bugs and feature requests
* View all reported issues
* Update issue details based on permissions
* Delete issues (Maintainer only)
* Manage issue workflow securely using JWT Authentication

---

## 🛠️ Technology Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Raw SQL (`pool.query`)
* bcrypt
* jsonwebtoken (JWT)

---

## ✨ Features

### Authentication

* User Registration
* User Login
* Password Hashing with bcrypt
* JWT Token Generation
* JWT Verification Middleware

### Issue Management

* Create Issue
* Get All Issues
* Get Single Issue
* Update Issue
* Delete Issue

### Authorization

#### Contributor

* Register
* Login
* Create Issue
* View Issues
* Update Own Issue (Only when status is open)

#### Maintainer

* All Contributor Permissions
* Update Any Issue
* Delete Any Issue
* Change Issue Status

---

## 📂 Project Structure

src/
│
├── app.ts
├── server.ts
│
├── config/
│
├── DB/
│ ├── db.ts
│ └── initDB.ts
│
├── middlewares/
│ ├── auth.ts
│ └── role.ts
│
├── modules/
│ ├── auth/
│ └── issues/
│
├── utils/
│ ├── sendResponse.ts
│ └── sendError.ts

---

## 🗄️ Database Schema

### Users Table

| Field      | Type      |
| ---------- | --------- |
| id         | SERIAL    |
| name       | VARCHAR   |
| email      | VARCHAR   |
| password   | VARCHAR   |
| role       | VARCHAR   |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

### Issues Table

| Field       | Type      |
| ----------- | --------- |
| id          | SERIAL    |
| title       | VARCHAR   |
| description | TEXT      |
| type        | VARCHAR   |
| status      | VARCHAR   |
| reporter_id | INTEGER   |
| created_at  | TIMESTAMP |
| updated_at  | TIMESTAMP |

---

## 🔐 Environment Variables

Create a `.env` file:

PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_secret_key

---

## ⚙️ Installation

### Clone Repository

git clone <repository-url>

### Install Dependencies

npm install

### Run Development Server

npm run dev

### Build Project

npm run build

### Start Production Server

npm start

---

## 🌐 API Endpoints

### Authentication

#### Register User

POST /api/auth/signup

#### Login User

POST /api/auth/login

---

### Issues

#### Create Issue

POST /api/issues

#### Get All Issues

GET /api/issues

Query Parameters:

* sort=newest
* sort=oldest
* type=bug
* type=feature_request
* status=open
* status=in_progress
* status=resolved

#### Get Single Issue

GET /api/issues/:id

#### Update Issue

PATCH /api/issues/:id

#### Delete Issue

DELETE /api/issues/:id

---

## 🔒 Authentication Flow

1. User registers an account.
2. User logs in using email and password.
3. Server validates credentials.
4. Server generates JWT token.
5. Client stores token.
6. Protected routes require Authorization header.
7. Middleware verifies token before processing requests.

---

## 📌 Business Rules

### Create Issue

* Authenticated users only

### Update Issue

Maintainer:

* Can update any issue

Contributor:

* Can update only own issue
* Issue status must be open

### Delete Issue

* Maintainer only

---

## 📬 Sample Authorization Header

Authorization: <JWT_TOKEN>

---

## 👨‍💻 Author

Name: Your Name

Email: [your-email@example.com](mailto:your-email@example.com)

---

## 📄 License

This project was developed for educational and assignment purposes.
