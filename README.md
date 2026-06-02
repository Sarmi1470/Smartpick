# 📚 SmartPick - AI-Powered Book Decision Support System

<img width="736" height="241" alt="image" src="https://github.com/user-attachments/assets/6952f29a-79c3-42a1-9e0a-098705ceb606" />

## 🎯 Problem Statement

> "Staring at multiple books and overthinking every single one? Yeah… we've all been there."

Readers spend **30+ minutes** comparing similar books, overwhelmed by endless options. SmartPick reduces **choice paralysis** by asking the right questions and recommending ONE book with explanation.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **ISBN Scanner** | Scan book barcodes (camera + manual entry) |
| 📖 **Single Book Lookup** | Instant book details + AI summary |
| ⚖️ **Multi-Book Comparison** | Compare 2-5 books side-by-side |
| 🧠 **Personalized Quiz** | 8-15 dynamic questions based on scanned books |
| 🏆 **AI Recommendation** | Get ONE winner with confidence score + explanation |
| 🎲 **Surprise Me** | Discover books based on mood & preferences |
| 📊 **Reading Personality** | 10 personality types based on reading habits |

## 🎨 Design Theme

**Dark Academia** - Deep charcoal backgrounds, muted gold accents, glassmorphism UI

- Colors: `#0F172A` · `#F59E0B` · `#A78BFA` · `#E5E7EB`
- Fonts: Playfair Display (headings) + Inter (body)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)              │
│          Dark Academia UI · ISBN Scanner · Quiz         │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                │
│            Book API · Quiz API · Session Mgmt           │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│     MONGODB DATABASE     │  │     AI SERVICE           │
│   52,000+ Books          │  │  Question Generation     │
│   Quiz Sessions          │  │  Scoring · Explanation   │
└──────────────────────────┘  └──────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, ZXing Scanner |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Pinecone DB |
| **AI Engine** | Custom recommendation engine, quiz generation, personality profiling |
| **Tools** | Git, Postman, MongoDB Compass, VS Code |

## 📦 Data Source

- **52,000+ books** from Kaggle public dataset
- Fields: ISBN, title, authors, categories, pages, ratings, descriptions
- Imported via CSV → MongoDB with batch processing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/Sarmi1470/Smartpick.git
cd smartpick

# Install backend dependencies
cd smartpick-backend
npm install

# Install frontend dependencies
cd ../smartpick-frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI
```

### Running the Application

```bash
# Terminal 1: Start Backend (port 5000)
cd smartpick-backend
npm run dev

# Terminal 2: Start Frontend (port 5173)
cd smartpick-frontend
npm run dev

# Terminal 3: Start AI Service (port 3001) - if applicable
cd smartpick-ai
node server.js
```

Open http://localhost:5173

## 📁 Project Structure

```
smartpick/
├── smartpick-backend/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API endpoints
│   │   └── middleware/      # Error handling, validation
│   └── server.js
│
├── smartpick-frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── sections/        # Page sections (Hero, Compare, etc.)
│   │   ├── context/         # React Context API
│   │   ├── services/        # API service layer
│   │   └── App.jsx
│   └── main.jsx
│
└── smartpick-ai/            # (Optional) AI service
    └── server.js
```

## 🔄 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books/isbn/:isbn` | Fetch book by ISBN |
| POST | `/api/books/compare` | Get multiple books |
| POST | `/api/quiz/compare/start` | Start comparison quiz |
| POST | `/api/quiz/:sessionId/answer` | Submit quiz answer |
| GET | `/api/quiz/:sessionId/results` | Get recommendation |

## 🧪 Testing

```bash
# Test ISBN lookup
curl http://localhost:5000/api/books/isbn/9780451524935

# Test comparison
curl -X POST http://localhost:5000/api/books/compare \
  -H "Content-Type: application/json" \
  -d '{"isbns": ["9780451524935", "9780141439518"]}'
```

## 📊 Database Schema

```javascript
// Book Schema
{
  isbn: String (unique, indexed),
  title: String,
  authors: [String],
  categories: [String],
  pages: Number,
  moodVibes: [String],
  readingDifficulty: String,
  ratings: { average: Number, count: Number },
  aiEnriched: Boolean
}

// QuizSession Schema
{
  sessionId: String (unique),
  scannedBooks: [{ bookId, isbn }],
  questions: [{ question, options, userAnswer }],
  results: { recommendation, alternatives },
  completed: Boolean
}
```


## 📚 Learnings

- Full-stack architecture with React + Node.js
- ISBN barcode scanning integration
- MongoDB indexing for fast lookups (50ms response)
- Rule-based recommendation engine (no external AI APIs)
- Dark Academia UI/UX design principles
- CSV batch processing for 52,000+ records

## 🔮 Future Scope

- User authentication & reading history
- Collaborative filtering ("readers also liked")
- Mobile app (React Native)
- Advanced ML models for better recommendations
- Social features (share, follow, reviews)


## 🙏 Acknowledgments

- Kaggle for book dataset
- ZXing for barcode scanning library
- Lucide for beautiful icons

---

## 📬 Contact

Sarmi Hazra - work.email.sarmi@gmail.com

Project Link: https://github.com/Sarmi1470/Smartpick

---

⭐ If this project helped you, give it a star!
```

---
