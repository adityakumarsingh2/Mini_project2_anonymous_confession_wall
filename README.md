# 🕵️ Anonymous Confession Wall (MERN Stack)

A full-stack anonymous confession platform built using the MERN stack where users can log in with Google, post confessions anonymously, comment, react, and explore trending confessions — all while maintaining complete privacy.

---

## 🚀 Live Concept

Users authenticate via Google but their identity remains hidden.
Each user is assigned:
- 🎭 Random username
- 🖼 Random avatar (via external avatar API)

No real identity is exposed publicly.

---

## ✨ Core Features

### 🔐 Authentication
- Google OAuth 2.0 login
- Secure session handling
- Protected routes

### 🎭 Anonymous Identity System
- Random display name generator
- Random avatar fetched via API
- Real Google data never exposed publicly

### 📝 Confession System
- Post anonymous confessions
- View global confession feed
- Timestamped posts

### 💬 Comment System
- Comment anonymously on confessions
- Nested interaction structure

### ❤️ Reaction System
- Like / react to confessions
- Real-time reaction updates

### 📈 Trending Section
- Dynamic trending algorithm
- Based on engagement (likes + comments)
- Highlights most active confessions

---

## 🛠 Tech Stack (MERN)

### Frontend
- React (Vite)
- Axios
- Context API / State Management

### Backend
- Node.js
- Express.js
- RESTful API Architecture

### Database
- MongoDB Atlas
- Mongoose ODM

### Authentication
- Passport.js
- passport-google-oauth20

### External APIs
- Random avatar API
- Random username generator API

---

## 🧱 Architecture Overview

```
Client (React)
    ↓
Express REST API
    ↓
MongoDB Atlas
```

Authentication handled via Google OAuth.
Anonymous display logic handled separately from Google identity.

---

## 🔐 Privacy Design

- Google login used only for authentication.
- Anonymous name & avatar replace real identity.
- Email & Google ID never exposed in confession feed.
- Environment variables secured using `.env`.

---

## ⚙️ Environment Variables

Create a `.env` file inside server folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_secret_key
```

---

## ▶️ Installation

### Clone Repository

```
git clone https://github.com/your-username/repository-name.git
```

### Backend Setup

```
cd server
npm install
npm start
```

### Frontend Setup

```
cd client
npm install
npm run dev
```

---

## 📊 Future Enhancements

- 🔥 NGL-style personal anonymous links
- 🤖 AI-based content moderation
- 📊 Analytics dashboard
- 💎 Premium anonymous insights
- 🌙 Dark mode
- 📱 Mobile-first UI improvements

---

## 🎯 Project Highlights

This project demonstrates:

- Full-stack MERN development
- Secure authentication
- REST API design
- MongoDB schema design
- Anonymous identity abstraction
- Engagement-based ranking logic
- Real-world scalable architecture

---

## 👨‍💻 Author

Aditya Kumar Singh  
B.Tech CSE  
Full Stack Developer | MERN Enthusiast

---

⭐ If you found this project interesting, consider giving it a star!
