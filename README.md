# 🔍 LostLink

> A smart, secure, and real-time platform designed to reunite people with their lost belongings.

**LostLink** is a modern, full-stack Web Application that bridges the gap between those who have lost an item and the kind samaritans who have found one. Finding a lost wallet, phone, or pet can be incredibly stressful, and posting on generic social media groups is often ineffective and chaotic. LostLink solves this by providing a dedicated, intelligent, and private environment to report, match, and securely claim items.

---

## 📖 How It Works (What the App Does)

LostLink is built around a seamless, secure user journey to prevent fraud while making it effortless to connect.

1. **Reporting Items:** 
   - **Lost an item?** You can easily create a "Lost Item" report detailing the category, description, and an interactive map pinpointing the last known location.
   - **Found an item?** You can create a "Found Item" listing. You upload images and provide a location, but you are encouraged to hold back a few "secret" identifying details.
   
2. **Intelligent Matching System:**
   - Instead of users endlessly scrolling through feeds, LostLink's backend automatically scans the database. If the system detects that a recently "Found" item matches the description, category, and location radius of a "Lost" item, it instantly creates a **Potential Match** and alerts both parties in real-time.

3. **Secure Claiming & Ownership Challenges:**
   - To prevent bad actors from claiming expensive items that don't belong to them, LostLink implements a unique **Challenge System**. 
   - When a user attempts to claim a found item, the finder can ask "Security Questions" (e.g., "What is the lock screen wallpaper?" or "What color is the inner lining?").
   - The claimant must answer these questions. The system scores their answers, and if the finder approves the claim, the communication channels are unlocked.

4. **Private Real-Time Chat:**
   - Once a claim is approved, a secure, private chat is opened between the two users. 
   - Operating exactly like modern messaging apps (WhatsApp, iMessage), the chat provides a single unified thread, real-time message delivery, typing indicators, and image sharing, allowing users to safely coordinate a meetup without giving away their personal phone numbers.

---

## 🚀 Core Features

- **Algorithmic Matchmaking:** Automated suggestions comparing lost and found databases based on proximity, dates, and item metadata.
- **Security-First Claim Process:** Challenge-response mechanics to verify true ownership.
- **Unified Real-Time Messaging:** WebSockets-powered chat system that guarantees instant message delivery, live typing indicators, and consolidated conversation history.
- **Interactive Geolocation Maps:** Integrated Leaflet maps for accurate spatial reporting of where items were dropped or discovered.
- **Live Notifications:** In-app toaster notifications alert users instantly when their item gets a match, their claim is approved, or they receive a new message.
- **Media Uploads:** Secure and optimized image processing for found items.
- **Responsive Dashboard:** A clean, glassmorphic UI that works flawlessly on both desktop and mobile browsers.

---

## 💻 Technology Stack

### Frontend Architecture
- **React.js** (v18)
- **Vite** - Lightning-fast development server and bundler.
- **Tailwind CSS** - Utility-first framework for the modern, aesthetic UI.
- **Zustand** - Used for lightweight, predictable global state management (managing active chats and notifications).
- **React Query (@tanstack/react-query)** - Handles server-state caching, background data refetching, and API synchronization.
- **Socket.io-client** - Facilitates the persistent, bidirectional WebSocket connection for live features.
- **React Router Dom** - Client-side routing.
- **Leaflet & React-Leaflet** - Powers the interactive map interfaces.

### Backend Architecture
- **Node.js & Express.js** - Robust, scalable server environment.
- **MongoDB & Mongoose** - NoSQL database used for flexible document storage of users, items, matches, and chats.
- **Socket.io** - Manages WebSockets rooms and real-time event broadcasting to individual connected users.
- **Multer & Sharp** - Middleware for handling multipart/form-data and processing/resizing image uploads before storage.
- **JWT (JSON Web Tokens)** - Stateless, secure authentication strategy.
- **Bcrypt.js** - Cryptographic hashing for user passwords.

---

## 📂 Project Structure

The project is structured as a monorepo, clearly separating the client and server codebases:

```text
lostlink/
├── backend/               # Node.js Express server
│   ├── src/
│   │   ├── config/        # Database connection & logger configurations
│   │   ├── controllers/   # Route handler logic (auth, chat, items, claims)
│   │   ├── middleware/    # JWT verification, Multer upload handling
│   │   ├── models/        # Mongoose schemas (User, LostItem, FoundItem, Chat)
│   │   ├── routes/        # Express API endpoints mapping
│   │   ├── services/      # Core business logic (matching algorithms, notifications)
│   │   └── sockets/       # Socket.io event listeners and emitters
│   └── server.js          # Main entry point & crash-resilient wrapper
│
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components (Modals, Buttons, Maps)
│   │   ├── hooks/         # Custom React hooks (e.g., singleton useSocket hook)
│   │   ├── pages/         # Top-level Page components (Dashboard, ChatPage)
│   │   ├── services/      # Axios-based API communication layer
│   │   ├── store/         # Zustand global state slices
│   │   └── utils/         # Helper functions and formatters
│   └── index.html
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (A local instance or a MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lostlink
```

### 2. Backend Setup
Navigate into the backend folder and install the dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the root of the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```
Start the backend development server:
```bash
npm run server
```

### 3. Frontend Setup
Open a **new** terminal window, navigate into the frontend folder, and install its dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file in the root of the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application
Open your favorite browser and navigate to `http://localhost:5173`. You can register a new account to start exploring the dashboard!

---

## 🧠 Architectural Highlights & Decisions

- **Singleton WebSocket Pattern:** The frontend utilizes a globally instanced Socket.io connection (`useSocket`). This ensures that no matter how many components need real-time data, only a single connection pipeline is opened to the server, preventing duplicate message rendering and memory leaks.
- **Crash Resilience:** The backend `server.js` is equipped with specific handlers to intercept `MongoNetworkError`s, ensuring that brief network hiccups between the server and the database do not cause the entire application to fatally crash.
- **Unified Chat Routing:** The Chat schema uses an intelligent querying design (`$all` operator on participants) to ensure that users are always routed back to a single, authoritative chat thread with one another, preventing the clutter of duplicate chat rooms.
