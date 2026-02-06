# Quiz Application

This React-based quiz application with support for multiple question types was the result of desperate vibecoding in preparation for an exam.

## Features

- **Multiple Question Types**:
  - Multiple choice questions
  - Fill-in-the-blank questions
  - Matching questions

- **Quiz Features**:
  - Progress tracking
  - Difficulty badges (Easy, Medium, Hard)
  - Score calculation and results display
  - Retake quiz functionality
  - Navigation between questions

- **Score Display**:
  - Shows number of correct answers
  - Displays percentage score
  - Provides feedback based on performance

## Local installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── assets
├── components/
│   ├── Quiz.jsx          # Main quiz component
│   ├── Quiz.css          # Quiz styling
│   ├── QuestionTypes.jsx # Question type components
│   └── QuestionTypes.css # Question type styling
├── quizData.js           # Hardcoded quiz questions
├── App.jsx               # Main App component
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## Customizing Questions

Upload the quiz questions as a JSON structure with different question types:

- **Multiple Choice**: Requires options (A-D) and an answer key
- **Fill in the Blank**: Requires an answer string
- **Matching**: Requires pairs of terms and definitions

```{
  "quiz_id": "pdf_quiz_001",
  "source": "uploaded_pdf",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "difficulty": "medium",
      "question": "What is the primary purpose of ...?",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "answer": "B"
    },
    {
      "id": 2,
      "type": "fill_in_the_blank",
      "difficulty": "easy",
      "question": "_____ is defined as ...",
      "answer": "Correct term"
    },
    {
      "id": 3,
      "type": "matching",
      "difficulty": "hard",
      "pairs": {
        "Term 1": "Definition 1",
        "Term 2": "Definition 2"
      }
    }
  ]
}```

**Future work**
- timed vs. free mode
- question type that would support images
- more styling
- remove AI slop & fix documentation