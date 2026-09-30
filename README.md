# Job Application Portal - RESTful API

Live API URL: https://job-portal-api-kr3j.onrender.com

A RESTful API built with Node.js, Express.js, MongoDB, Multer, and JWT authentication. Candidates can register, log in, upload resumes, browse job listings, submit job applications, and track application statuses.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Getting Started (Local Setup)](#getting-started-local-setup)
5. [Environment Variables](#environment-variables)
6. [API Endpoints Documentation](#api-endpoints-documentation)
   - [Authentication Endpoints](#1-authentication-endpoints)
   - [Resume Endpoints](#2-resume-endpoints)
   - [Job Endpoints](#3-job-endpoints)
   - [Application Endpoints](#4-application-endpoints)
7. [Postman Collection & Testing](#postman-collection--testing)

---

## Core Features

- User Authentication: Secure candidate registration and login with bcrypt password hashing and JWT access and refresh tokens.
- Resume Upload: Multi-part file uploads handled through Multer (restricted to PDF, DOC, and DOCX files up to 5MB) and stored in Cloudinary.
- Job Listings: Browse active job openings with text search, job type filtering, and pagination.
- Sample Jobs: 5 sample jobs automatically seeded to MongoDB on initial startup.
- Job Applications: Authenticated candidates can apply to active jobs using their profile resume or an attached file, with duplicate application prevention.
- Application Tracking: View all submitted applications with populated job details and status.

---

## Technology Stack

- Runtime: Node.js
- Framework: Express.js (ES Modules)
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens (jsonwebtoken) and bcryptjs
- File Uploads: Multer with Cloudinary cloud storage
- Security & Utilities: CORS, Helmet, Cookie-Parser, Morgan, Dotenv

---

## Project Architecture

```text
Job-Portal-API/
├── public/
│   └── temp/                        # Temporary staging directory for Multer uploads
├── src/
│   ├── db/
│   │   └── index.js                 # Database connection logic
│   ├── constants.js                 # Application constants
│   ├── controllers/
│   │   ├── healthcheck.controller.js# Health check logic
│   │   ├── user.controller.js       # Register, login, profile logic
│   │   ├── resume.controller.js     # Resume upload logic
│   │   ├── job.controller.js        # Job search and listing logic
│   │   └── application.controller.js# Application submission and tracking logic
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification (Cookie & Bearer)
│   │   └── multer.middleware.js     # Multer storage configuration
│   ├── models/
│   │   ├── user.model.js            # User schema and auth methods
│   │   ├── job.model.js             # Job schema
│   │   └── application.model.js     # Application schema
│   ├── routes/
│   │   ├── healthcheck.routes.js    # Health check routes
│   │   ├── user.routes.js           # User & auth routes
│   │   ├── resume.routes.js         # Resume routes
│   │   ├── job.routes.js            # Job routes
│   │   └── application.routes.js    # Application routes
│   ├── utils/
│   │   ├── ApiError.js              # Custom error class
│   │   ├── ApiResponse.js           # Standardized response wrapper
│   │   ├── asyncHandler.js          # Async controller wrapper
│   │   ├── cloudinary.js            # Cloudinary upload utility
│   │   └── seedJobs.js              # Sample jobs seeder
│   ├── app.js                       # Express app configuration
│   └── index.js                     # Application entry point
├── .env.example                     # Sample environment file
├── .gitignore
├── Job_Portal_API.postman_collection.json # Postman collection
├── package.json
└── README.md
```

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (MongoDB Atlas or local)
- Cloudinary account for resume file storage

### Step 1: Clone and Install
```bash
git clone https://github.com/Sujal2156/Job-Portal-API.git
cd Job-Portal-API
npm install
```

### Step 2: Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Fill in your database URI, JWT secret keys, and Cloudinary credentials.

### Step 3: Run the Application
Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Manual job seeding (optional):
```bash
npm run seed
```

Server runs on: `http://localhost:5000`

---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | No | Server port (defaults to 8000 or 5000) |
| `MONGODB_URI` / `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` / `JWT_SECRET` | Yes | Secret key used for signing JWT access tokens |
| `ACCESS_TOKEN_EXPIRY` | No | Access token expiration (default: `1d`) |
| `REFRESH_TOKEN_SECRET` | Yes | Secret key for signing JWT refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh token expiration (default: `10d`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for resume hosting |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `*`) |

---

## API Endpoints Documentation

All protected endpoints require an `Authorization` header with a Bearer token or a valid `accessToken` cookie:
```text
Authorization: Bearer <access_token>
```

### 1. Authentication Endpoints

#### Register Candidate
- **Method:** `POST`
- **URL:** `/api/v1/auth/register` (also `/api/auth/register`)
- **Access:** Public
- **Request Body (JSON):**
```json
{
  "fullName": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "password": "Password123!"
}
```
- **Response (`201 Created`):**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "673f1a2b3c4d5e6f7a8b9c0d",
      "fullName": "Priya Sharma",
      "username": "priya.sharma",
      "email": "priya.sharma@example.com",
      "role": "candidate",
      "resume": "",
      "createdAt": "2026-09-29T10:00:00.000Z",
      "updatedAt": "2026-09-29T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully",
  "success": true
}
```

---

#### Login Candidate
- **Method:** `POST`
- **URL:** `/api/v1/auth/login` (also `/api/auth/login`)
- **Access:** Public
- **Request Body (JSON):**
```json
{
  "email": "priya.sharma@example.com",
  "password": "Password123!"
}
```
- **Response (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "673f1a2b3c4d5e6f7a8b9c0d",
      "fullName": "Priya Sharma",
      "username": "priya.sharma",
      "email": "priya.sharma@example.com",
      "role": "candidate",
      "resume": ""
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in successfully",
  "success": true
}
```

---

#### Get Current User Profile
- **Method:** `GET`
- **URL:** `/api/v1/auth/me` (also `/api/auth/me` or `/api/v1/users/current-user`)
- **Access:** Private (Bearer Token)
- **Response (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "fullName": "Priya Sharma",
    "username": "priya.sharma",
    "email": "priya.sharma@example.com",
    "role": "candidate",
    "resume": "https://res.cloudinary.com/your_cloud/raw/upload/v12345/resume.pdf"
  },
  "message": "Current user fetched successfully",
  "success": true
}
```

---

### 2. Resume Endpoints

#### Upload Resume
- **Method:** `POST`
- **URL:** `/api/v1/resumes/upload` (also `/api/resumes/upload`)
- **Access:** Private (Bearer Token)
- **Content-Type:** `multipart/form-data`
- **Form Field:** `resume` (Allowed: `.pdf`, `.doc`, `.docx`, max 5MB)
- **Response (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "resume": "https://res.cloudinary.com/your_cloud/raw/upload/v12345/resume.pdf"
  },
  "message": "Resume uploaded successfully",
  "success": true
}
```

---

#### Get Candidate Resume
- **Method:** `GET`
- **URL:** `/api/v1/resumes/my-resume` (also `/api/resumes/my-resume`)
- **Access:** Private (Bearer Token)
- **Response (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "resume": "https://res.cloudinary.com/your_cloud/raw/upload/v12345/resume.pdf"
  },
  "message": "Resume retrieved successfully",
  "success": true
}
```

---

### 3. Job Endpoints

#### Get All Job Listings
- **Method:** `GET`
- **URL:** `/api/v1/jobs` (also `/api/jobs`)
- **Query Parameters:** `search`, `jobType`, `page`, `limit`
- **Access:** Public
- **Response (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "jobs": [
      {
        "_id": "673f1a2b3c4d5e6f7a8b9c11",
        "title": "Senior Backend Engineer (Node.js)",
        "company": "FinTech Innovations Inc.",
        "location": "Remote",
        "jobType": "Full-time",
        "description": "Architect and maintain microservices with Node.js and MongoDB.",
        "requirements": [
          "4+ years of professional backend development with Node.js and Express",
          "Solid experience with MongoDB"
        ],
        "salary": "$110,000 - $140,000 / year",
        "status": "active",
        "createdAt": "2026-09-29T09:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1,
    "count": 5
  },
  "message": "Jobs retrieved successfully",
  "success": true
}
```

---

#### Get Job Details by ID
- **Method:** `GET`
- **URL:** `/api/v1/jobs/:id` (also `/api/jobs/:id`)
- **Access:** Public
- **Response (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c11",
    "title": "Senior Backend Engineer (Node.js)",
    "company": "FinTech Innovations Inc.",
    "location": "Remote",
    "jobType": "Full-time",
    "description": "Architect and maintain microservices with Node.js and MongoDB.",
    "requirements": [
      "4+ years of professional backend development with Node.js and Express"
    ],
    "salary": "$110,000 - $140,000 / year",
    "status": "active"
  },
  "message": "Job details retrieved successfully",
  "success": true
}
```

---

### 4. Application Endpoints

#### Apply for a Job
- **Method:** `POST`
- **URL:** `/api/v1/applications` (also `/api/applications`)
- **Access:** Private (Bearer Token)

**Option A: Apply using already uploaded profile resume**
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "jobId": "673f1a2b3c4d5e6f7a8b9c11",
  "coverNote": "Excited to apply for this backend position!"
}
```

**Option B: Apply with a fresh resume file**
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `jobId`, `coverNote`, and `resume` file

- **Response (`201 Created`):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c99",
    "job": {
      "_id": "673f1a2b3c4d5e6f7a8b9c11",
      "title": "Senior Backend Engineer (Node.js)",
      "company": "FinTech Innovations Inc.",
      "location": "Remote",
      "jobType": "Full-time",
      "salary": "$110,000 - $140,000 / year"
    },
    "applicant": {
      "_id": "673f1a2b3c4d5e6f7a8b9c0d",
      "fullName": "Priya Sharma",
      "email": "priya.sharma@example.com"
    },
    "resume": "https://res.cloudinary.com/your_cloud/raw/upload/v12345/resume.pdf",
    "coverNote": "Excited to apply for this backend position!",
    "status": "applied",
    "createdAt": "2026-09-29T10:15:00.000Z"
  },
  "message": "Job application submitted successfully",
  "success": true
}
```

---

#### View My Submitted Applications
- **Method:** `GET`
- **URL:** `/api/v1/applications/my-applications` (also `/api/applications/my-applications`)
- **Access:** Private (Bearer Token)
- **Response (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "count": 1,
    "applications": [
      {
        "_id": "673f1a2b3c4d5e6f7a8b9c99",
        "job": {
          "_id": "673f1a2b3c4d5e6f7a8b9c11",
          "title": "Senior Backend Engineer (Node.js)",
          "company": "FinTech Innovations Inc.",
          "location": "Remote",
          "jobType": "Full-time",
          "salary": "$110,000 - $140,000 / year",
          "status": "active"
        },
        "resume": "https://res.cloudinary.com/your_cloud/raw/upload/v12345/resume.pdf",
        "coverNote": "Excited to apply for this backend position!",
        "status": "applied",
        "createdAt": "2026-09-29T10:15:00.000Z"
      }
    ]
  },
  "message": "Submitted applications retrieved successfully",
  "success": true
}
```

---

## Postman Collection & Testing

A ready-to-use Postman collection is included in the root directory:  
`Job_Portal_API.postman_collection.json`

### Usage:
1. Open Postman and import `Job_Portal_API.postman_collection.json`.
2. The collection uses variables:
   - `baseUrl`: `https://job-portal-api-kr3j.onrender.com` (or `http://localhost:5000` for local testing)
   - `token`: automatically set upon Register/Login
   - `jobId`: automatically set when browsing jobs
   - `applicationId`: automatically set upon job application
