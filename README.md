# VAANI AI – GenAI Job Preparation Application

VAANI AI is a GenAI-based job preparation application that helps students and job seekers practice technical interviews. It conducts an interview based on the user's profile, asks questions one by one, evaluates the answers, and gives feedback and skill scores.

The main goal of this project is to make interview preparation more interactive instead of just providing a list of questions.

---

## Product Overview

VAANI AI allows users to:

* Create a candidate profile
* Enter their technical skills
* Start an AI-based interview
* Answer questions one by one
* Get questions based on their selected skills
* Get AI-based answer evaluation
* Receive feedback and scores
* Get adaptive follow-up questions
* Experience difficulty adjustment
* Get project deep-dive questions
* View final assessment and skill scores
* Track their interview performance

The application is mainly designed for students and freshers preparing for software development interviews.

---

# Architecture

```text
                         User
                           |
                           v
                 React + Vite Frontend
                        (Vercel)
                           |
                           | REST API
                           v
                  Node.js + Express
                       (Render)
                           |
              +------------+------------+
              |                         |
              v                         v
         MongoDB Atlas             Gemini API
                                      |
                                      v
                              Question Generation
                              Answer Evaluation
```

### Frontend

The frontend is developed using React and Vite. It handles:

* Candidate profile
* Interview interface
* Question display
* Answer submission
* Feedback
* Final assessment
* Dashboard

### Backend

The backend is built using Node.js and Express.js.

It handles:

* Interview creation
* Question generation
* Answer evaluation
* Interview state
* Difficulty adaptation
* Skill scoring
* Database operations
* Gemini API integration

### Database

MongoDB Atlas is used to store interview-related information.

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

# Technology Stack

### Frontend

* React.js
* Vite
* Axios
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* REST API
* Axios

### Database

* MongoDB
* Mongoose
* MongoDB Atlas

### AI

* Google Gemini API
* Generative AI
* Prompt Engineering

### Deployment

* Vercel
* Render

---

# AI Model

VAANI AI uses the Gemini API for:

1. Generating interview questions
2. Evaluating candidate answers
3. Generating follow-up questions
4. Adapting question difficulty
5. Providing interview feedback

The AI receives information such as:

* Candidate skills
* Experience level
* Target role
* Previous questions
* Previous answers
* Current difficulty
* Current skill

---

# Prompt Strategy

The application does not send only the candidate's answer to Gemini.

The backend creates a structured prompt containing relevant interview context.

```text
Candidate Profile
        +
Technical Skills
        +
Current Skill
        +
Current Difficulty
        +
Previous Questions
        +
Previous Answers
        +
Current Answer
        ↓
    Gemini API
        ↓
Structured Evaluation
```

The AI is instructed to provide structured information such as:

```json
{
  "score": 8,
  "correctness": 8,
  "technical_depth": 7,
  "clarity": 8,
  "feedback": "Good explanation with relevant technical details."
}
```

This structured response makes it easier for the backend to process the evaluation and calculate the candidate's performance.

---

# Adaptive Questioning

VAANI AI changes the next question based on the candidate's previous answer.

For example:

```text
Strong Answer
     ↓
Increase Difficulty
     ↓
Deeper Follow-up Question
```

If the candidate struggles:

```text
Weak Answer
     ↓
Reduce Difficulty
     ↓
Simpler Question
```

This makes the interview more interactive and personalized.

---

# Difficulty Adaptation

The interview uses different difficulty levels:

```text
Easy
Medium
Hard
```

The difficulty is adjusted based on recent performance.

```text
Strong Performance
Easy → Medium → Hard
```

```text
Weak Performance
Hard → Medium → Easy
```

---

# Answer Evaluation

The AI evaluates the candidate's answer based on factors such as:

* Correctness
* Technical knowledge
* Technical depth
* Relevance
* Clarity
* Completeness

Example:

```text
Correctness       : 8/10
Technical Depth   : 7/10
Clarity           : 8/10
Relevance         : 9/10
Overall Score     : 8/10
```

The candidate also receives feedback explaining how the answer can be improved.

---

# Project Deep-Dive

VAANI can ask questions about the candidate's projects.

For example, if a candidate mentions a MERN or GenAI project, VAANI can ask:

* Why did you choose MongoDB?
* Why did you use React?
* How did you design the backend?
* How did you integrate the Gemini API?
* What technical challenges did you face?
* How did you handle API failures?
* How did you deploy the application?

This helps evaluate whether the candidate actually understands the projects mentioned in their profile.

---

# Skill Scoring

VAANI tracks performance for individual skills.

For example:

```text
JavaScript : 8.2
React      : 8.5
Node.js    : 7.8
MongoDB    : 8.0
```

This allows candidates to identify their strong and weak areas.

---

# Duplicate Question Detection

AI models can sometimes generate similar questions.

VAANI provides previous questions as context when generating a new question and instructs the AI to avoid repeating them.

The flow is:

```text
Generate Question
       ↓
Compare With Previous Questions
       ↓
   Duplicate?
    /     \
  Yes      No
   |        |
Regenerate Accept
```

---

# Database Design

MongoDB Atlas is used for storing interview information.

The interview data can contain:

```text
Interview
│
├── Candidate Profile
├── Skills
├── Questions
│   ├── Question
│   ├── Skill
│   ├── Difficulty
│   └── Answer
│
├── Evaluations
│   ├── Score
│   ├── Feedback
│   ├── Correctness
│   └── Technical Depth
│
└── Final Assessment
```

MongoDB was selected because its flexible document structure works well with interview data that can contain different questions, evaluations, and skills.

---

# API Structure

Main API base:

```text
/api/interview
```

### Start Interview

```http
POST /api/interview/start
```

Creates a new interview session.

### Submit Answer

```http
POST /api/interview/:id/answer
```

Submits an answer and evaluates it.

### Get Interview

```http
GET /api/interview/:id
```

Gets the interview information.

---

# Run the Project Locally

## Prerequisites

Before running VAANI AI locally, make sure you have installed:

* Node.js
* npm
* MongoDB Atlas account
* Gemini API key
* Git

You can check Node.js and npm using:

```bash
node -v
npm -v
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/Jayasankar-Bollam/Vaani-AI.git
```

Move into the project:

```bash
cd Vaani-AI
```

---

# 2. Setup Backend

Go to the server folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` folder:

```text
server/
├── routes/
├── ...
├── package.json
└── .env
```

Add your backend environment variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Use the actual environment variable names used by your backend code.

**Do not commit your `.env` file to GitHub.**

Start the backend:

```bash
npm start
```

If your project does not have an `npm start` script, use the command defined in your `server/package.json`.

The backend should run at:

```text
http://localhost:3000
```

You can test the health endpoint:

```text
http://localhost:3000/api/health
```

---

# 3. Setup Frontend

Open another terminal.

From the project root:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:3000/api/interview
```

The frontend API configuration uses:

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/interview",
});
```

Start the frontend:

```bash
npm run dev
```

Vite will normally provide a URL similar to:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 4. Run Frontend and Backend Together

You need two terminals.

### Terminal 1 — Backend

```bash
cd server
npm install
npm start
```

### Terminal 2 — Frontend

```bash
cd client
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

The request flow will be:

```text
React
  ↓
http://localhost:3000/api/interview
  ↓
Express
  ↓
Gemini API
  ↓
MongoDB
```

---

# Environment Variables

### Backend

Keep backend secrets inside:

```text
server/.env
```

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend

The frontend only needs the backend API URL:

```env
VITE_API_URL=http://localhost:3000/api/interview
```

For production:

```env
VITE_API_URL=https://vaani-ai-t82t.onrender.com/api/interview
```

Do not put secret API keys such as the Gemini API key inside the frontend environment variables.

---

# Deployment

## Frontend

The frontend is deployed using Vercel.

Production API URL:

```text
https://vaani-ai-t82t.onrender.com/api/interview
```

Set the following environment variable in Vercel:

```text
VITE_API_URL=https://vaani-ai-t82t.onrender.com/api/interview
```

After changing environment variables, redeploy the Vercel application.

## Backend

The backend is deployed using Render.

The backend uses the Render-provided `PORT` environment variable.

The server listens on:

```js
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0");
```

---

# Limitations

### AI Dependency

The quality of questions and evaluations depends on the AI model.

### AI Evaluation

AI evaluation may not always understand every possible valid answer.

### API Limits

The application depends on the availability and rate limits of the Gemini API.

### Text-Based Interview

The current version mainly focuses on text-based technical interviews.

### Limited Interview Types

The current version mainly focuses on technical interview preparation. HR and behavioral interviews can be expanded further.

---

# Future Improvements

Some improvements planned for the future are:

* Voice-based AI interviews
* Speech-to-text support
* Real-time AI interviewer
* HR and behavioral interview mode
* Resume-based interview questions
* Job-description-based preparation
* Advanced system design interviews
* Better duplicate question detection
* Improved skill prediction
* Interview history
* Progress tracking
* Personalized learning recommendations
* Detailed performance analytics
* Multiple AI model support

---

# What I Learned

While building VAANI AI, I learned how to integrate Generative AI into a full-stack application.

I gained practical experience in:

* React development
* REST API development
* Node.js and Express.js
* MongoDB and Mongoose
* Gemini API integration
* Prompt engineering
* Structured AI responses
* Adaptive question generation
* AI-based answer evaluation
* Error handling
* CORS
* Environment variables
* Vercel deployment
* Render deployment
* Connecting frontend and backend in production

---

# Future Vision

The long-term goal of VAANI AI is to behave more like a real technical interviewer.

Instead of only asking predefined questions, VAANI should understand the candidate's responses, identify knowledge gaps, ask relevant follow-up questions, adjust difficulty, and provide a personalized preparation plan.

```text
Candidate Profile
       ↓
AI Interview
       ↓
Answer Evaluation
       ↓
Skill Analysis
       ↓
Adaptive Questions
       ↓
Project Deep-Dive
       ↓
Final Assessment
       ↓
Dashboard
       ↓
Personalized Preparation
```

VAANI AI is a full-stack GenAI project built to explore how Generative AI and adaptive interview systems can be combined to create a more personalized interview preparation experience.
