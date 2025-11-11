# 🕷️ LinkCrawler<img width="1024" height="1536" alt="image" src="https://github.com/user-attachments/assets/c0584bbb-240b-4c61-a1ec-327c7e5dc83b" />

f139e-ec75-4d35-a1fc-dcab736fb2f1" />


> A full-stack link manager that helps you save, search, and organize your favorite links — built as a WebTech mini project.

[![Frontend](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://reactjs.org)
[![Backend](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-MongoDB-%2347A248?logo=mongodb)](https://www.mongodb.com)

---

## 🚀 Overview

**LinkCrawler** is a modern, responsive web app that allows users to:
- Add and manage useful links.
- Search and organize them efficiently.
- Delete or edit saved links easily.

It integrates a **React frontend**, **Node.js + Express backend**, and a **MongoDB** database for persistent storage.

---

## ✨ Features
- 🔐 User Authentication (Register/Login)
- ➕ Add new links with title, URL, and notes
- 🔍 Real-time search through saved links
- 🗑️ Delete existing links
- 💡 Clean, responsive UI built with React and TailwindCSS

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React (Vite), TailwindCSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (JSON Web Tokens) |

---

## 🗂️ Folder Structure

LINKCRAWLER/
├── backend/ # Express + MongoDB API
│ ├── routes/ # Routes for users and links
│ ├── models/ # Mongoose schemas
│ ├── middleware/ # Auth middleware
│ ├── server.js # Entry point
│ └── .env.example # Example environment variables
│
└── frontend/ # React client (Vite)
├── src/ # Components & pages
├── public/ # Static assets
└── vite.config.js # Vite setup

---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
npm install
MONGO_URI=mongodb://127.0.0.1:27017/linkcrawler
JWT_SECRET=your_jwt_secret
PORT=4000
npm start
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=4000
VITE_API_BASE=http://localhost:4000
## 👨‍💻 Contributors

| Name | Role |
|------|------|
| **Aryan Mittal** |  Developer |
| **Aniket Raosaheb Jadhav** | Developer |
| **Anirudh Nagarajan** | Developer |
