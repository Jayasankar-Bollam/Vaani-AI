# VAANI AI – GenAI Job Preparation Application

VAANI AI is a GenAI-based job preparation application that helps students and job seekers practice technical interviews. It conducts an interview based on the user's profile, asks questions one by one, evaluates the answers, and gives feedback and skill scores.

The main goal of this project is to make interview preparation more interactive instead of just providing a list of questions.

## Product Overview

VAANI AI allows users to:

* Enter their profile and technical skills
* Start an AI-based interview
* Answer questions one by one
* Get questions based on their selected skills
* Get evaluated on their answers
* Receive feedback and scores
* Continue with questions based on their previous answers
* Track their performance across different skills

The application is mainly designed for students and freshers preparing for software development interviews.

---

## Architecture

The application follows a simple frontend-backend architecture.

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
        +---------+---------+
        |                   |
        v                   v
    MongoDB Atlas       GenAI Model
                         |
                         v
                  Answer Evaluation
                  Question Generation
```

### Frontend

The frontend is developed using React and Vite. It handles:

* User profile input
* Interview screen
* Question display
* Answer submission
* Feedback display
* Score display

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

### Database

MongoDB Atlas is used to store interview-related information.

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## Technology Choices

### React.js

React was used because it provides a component-based structure and makes it easier to build interactive interview screens.

### Vite

Vite provides fast development and a simple build process for the React application.

### Node.js

Node.js is used for the backend because it works well with JavaScript and asynchronous API requests.

### Express.js

Express is used to create REST APIs and manage the backend routes.

### MongoDB

MongoDB is used because interview data can have different structures and MongoDB provides a flexible document-based database.

### Axios

Axios is used in the frontend for communication with the backend APIs.

### Vercel

Vercel is used to deploy the React frontend.

### Render

Render is used to deploy the Node.js and Express backend.

---

# AI Model

VAANI AI uses a Generative AI model for generating interview questions and evaluating user answers.

The model is used for two main tasks:

1. Question generation
2. Answer evaluation

The AI receives information such as:

* Candidate skills
* Experience level
* Previous questions
* Previous answers
* Current difficulty
* Interview context

Based on this information, it generates the next question or evaluates the submitted answer.

---

# Prompt Strategy

Instead of sending only the user's answer to the AI model, VAANI provides structured context.

The prompt contains information such as:

```text
Candidate Skills
Experience Level
Current Skill
Current Difficulty
Previous Questions
Previous Answers
Current Answer
```

The AI is instructed to return structured evaluation information.

For example:

```json
{
  "score": 7,
  "correctness": 8,
  "technical_depth": 6,
  "clarity": 7,
  "feedback": "Good explanation but the answer can include more details."
}
```

Structured responses make it easier for the backend to process the evaluation and calculate the candidate's skill score.

---

# Adaptive Questioning Logic

VAANI AI does not ask the same type of question throughout the interview.

The next question is selected based on the candidate's previous performance.

For example:

```text
Good Answer
     |
     v
Increase difficulty
     |
     v
Medium/Hard Question
```

If the candidate struggles:

```text
Weak Answer
     |
     v
Reduce difficulty
     |
     v
Easier Question
```

This makes the interview more similar to a real interview where the interviewer changes the difficulty based on the candidate's responses.

---

# Answer Evaluation

After the candidate submits an answer, the answer is sent to the backend.

The AI evaluates different aspects of the answer.

Some of the evaluation factors are:

* Correctness
* Technical knowledge
* Technical depth
* Relevance
* Clarity
* Completeness

The evaluation result is converted into a score.

For example:

```text
Correctness       : 8/10
Technical Depth   : 7/10
Clarity           : 8/10
Relevance         : 9/10
--------------------------------
Overall Score     : 8/10
```

The feedback is also shown to the user so they understand where they can improve.

---

# Difficulty Adaptation

The interview maintains a current difficulty level.

The difficulty can be:

```text
Easy
Medium
Hard
```

The difficulty is adjusted based on the candidate's recent performance.

For example:

```text
Strong performance
        ↓
Easy → Medium → Hard
```

If the candidate gives weak answers:

```text
Weak performance
        ↓
Hard → Medium → Easy
```

This prevents the interview from becoming too easy or too difficult for the candidate.

---

# Skill Scoring

VAANI AI also tracks performance based on individual skills.

For example, if the candidate selects:

```text
JavaScript
React
Node.js
MongoDB
```

the application can maintain separate scores:

```text
JavaScript : 8.2
React      : 7.5
Node.js    : 6.8
MongoDB    : 8.0
```

This helps the candidate understand which technical areas are strong and which areas need more preparation.

---

# Duplicate Question Detection

One problem with AI-generated interviews is that the model can sometimes generate similar questions.

To reduce this problem, previous questions are provided to the AI when generating a new question.

The model is instructed not to repeat previous questions.

The application can also compare the newly generated question with previous questions before accepting it.

The basic flow is:

```text
Generate Question
       |
       v
Compare with Previous Questions
       |
   +---+---+
   |       |
Duplicate  New
   |       |
   v       v
Generate  Accept
Again
```

This helps keep the interview more dynamic.

---

# Database Design

MongoDB Atlas is used as the database.

The interview data contains information such as:

```text
Interview
│
├── Candidate Profile
├── Skills
├── Questions
│   ├── Question
│   ├── Difficulty
│   ├── Skill
│   └── Answer
│
├── Evaluations
│   ├── Score
│   ├── Feedback
│   ├── Correctness
│   └── Technical Depth
│
└── Overall Results
```

MongoDB was selected because the interview structure can change depending on the candidate's skills and the number of questions.

---

# API Structure

The backend exposes interview APIs.

Main API base:

```text
/api/interview
```

Example endpoints:

```text
POST /api/interview/start
```

Starts a new interview.

```text
POST /api/interview/:id/answer
```

Submits an answer and evaluates it.

```text
GET /api/interview/:id
```

Gets the interview details.

---

# Limitations

There are some limitations in the current version.

### 1. AI Dependency

The quality of questions and evaluations depends on the AI model.

Sometimes the model may generate questions that are too easy, too difficult, or similar to previous questions.

### 2. Evaluation is Not Perfect

AI-based evaluation cannot always understand every valid way of answering a technical question.

A candidate may give a correct answer in a different way and still receive a lower score.

### 3. Limited Interview Types

The current version mainly focuses on technical interview preparation.

Behavioral interviews, HR interviews, and system design interviews can be improved further.

### 4. API Availability

The application depends on the availability and limits of the AI API.

If the AI service is unavailable, question generation and evaluation may fail.

### 5. No Real-Time Voice Interview

The current version mainly works with text-based answers.

Voice-based interviews are not fully implemented yet.

---

# Future Improvements

Some improvements I would like to add in the future are:

* Voice-based AI interviews
* Speech-to-text support
* Real-time AI interviewer
* More advanced system design interviews
* HR and behavioral interview mode
* Resume-based interview questions
* Job-description-based interview preparation
* Better duplicate question detection
* Improved skill-level prediction
* Interview history and progress tracking
* Personalized learning recommendations
* More detailed performance analytics
* Multiple AI model support
* Interview difficulty customization

---

# What I Learned

While building VAANI AI, I learned how to integrate Generative AI into a full-stack application.

I also learned about:

* React application development
* REST API development
* MongoDB database design
* AI prompt engineering
* Structured AI responses
* AI-based answer evaluation
* Adaptive question generation
* Environment variables
* CORS
* Vercel deployment
* Render deployment
* Connecting frontend and backend in production

The project helped me understand how AI can be combined with a normal full-stack application to build a more personalized user experience.

---

# Future Vision

The long-term goal of VAANI AI is to make it behave more like a real technical interviewer.

Instead of only asking predefined questions, the system should understand the candidate's responses, identify knowledge gaps, ask follow-up questions, adjust difficulty, and provide a complete preparation plan.

```text
Profile
   ↓
AI Interview
   ↓
Answer Evaluation
   ↓
Skill Analysis
   ↓
Adaptive Questions
   ↓
Performance Report
   ↓
Personalized Preparation
```

VAANI AI is built as a learning project to explore how Generative AI, full-stack development, and adaptive interview systems can work together.
