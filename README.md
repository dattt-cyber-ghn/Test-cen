# Secure Test Center

A secure online test center application with anti-cheating measures.

## Features
- **Admin Dashboard**: Create tests with multiple question types (MCQ, True/False, Short Answer). Generate secure one-time access codes.
- **Secure Access**: Students login via access codes.
- **Anti-Cheating**:
    - Fullscreen enforcement (optional/suggested).
    - Tab switch monitoring with warnings and logging.
    - Timer enforcement.
- **Automatic Grading**: Instant results for objective questions.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)

## Setup & Run

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or have a URI ready)
  - Ensure MongoDB is running: `brew services start mongodb-community` (on Mac) or use a cloud URI.

### 1. Backend Setup
```bash
cd server
npm install
# Create .env if not exists (default provided)
npm run dev
```
Server runs on http://localhost:5000

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client runs on http://localhost:5173

## Verification Steps
1. Open Admin Dashboard at `/admin` (e.g. `http://localhost:5173/admin`).
2. Create a Test.
3. Generate an Access Code for that test.
4. Go to Home `/` and enter the code.
5. Take the test. Try switching tabs to see the warning.
6. Submit and view results.
