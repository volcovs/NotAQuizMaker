# Not a Quiz Maker
This quiz application was the result of desperate vibecoding in preparation for an exam. It supports multiple question types, sharing quizzes publicly via Dropbox, and timed/free modes. Enjoy your time here and good luck learning!

## Features

- **Multiple Question Types**:
  - Multiple choice questions
  - Multiple choice (multiple answers)
  - Fill-in-the-blank questions
  - Complete sentence questions
  - Matching questions
  - Image-based multiple choice

- **Quiz Features**:
  - Progress tracking
  - Difficulty badges (Easy, Medium, Hard)
  - Timed mode (10s/30s/1min per question) and free mode
  - Score calculation and results display
  - Retake quiz functionality
  - Navigation between questions
  - Shareable quiz links

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
.
├── netlify/
│   └── functions/
│       └── quiz.js           # Netlify Function (Dropbox storage API)
├── scripts/
│   └── cleanup-dropbox.js    # Scheduled cleanup helper
├── src/
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── Quiz.jsx          # Main quiz component
│   │   ├── Quiz.css          # Quiz styling
│   │   ├── QuestionTypes.jsx # Question type components
│   │   └── QuestionTypes.css # Question type styling
│   ├── quizData.js           # Example quiz questions
│   ├── App.jsx               # Main App component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── netlify.toml
├── package.json
└── README.md
```

## Customizing Questions

Upload the quiz questions as a JSON structure with different question types:

- **Multiple Choice**: Requires options (A-D) and an answer key
- **Multiple Choice (Multiple Answers)**: Requires options and an answers array
- **Fill in the Blank**: Requires an answer string
- **Complete Sentence**: Requires an answer string
- **Matching**: Requires pairs of terms and definitions
- **Image Multiple Choice**: Requires an imageUrl or imageBase64 and options (A-D) with an answer key

```
{
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
      "type": "multiple_choice_multiple_answers",
      "difficulty": "medium",
      "question": "Select all valid answers.",
      "options": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3",
        "D": "Option 4"
      },
      "answers": ["A", "C"]
    },
    {
      "id": 3,
      "type": "fill_in_the_blank",
      "difficulty": "easy",
      "question": "_____ is defined as ...",
      "answer": "Correct term"
    },
    {
      "id": 4,
      "type": "complete_sentence",
      "difficulty": "easy",
      "question": "Complete the sentence: The best tool is _____.",
      "answer": "practice"
    },
    {
      "id": 5,
      "type": "image_multiple_choice",
      "difficulty": "medium",
      "question": "What animal is shown?",
      "imageUrl": "https://example.com/images/animal.jpg",
      "imageAlt": "A photo of an animal",
      "options": {
        "A": "Cat",
        "B": "Dog",
        "C": "Fox",
        "D": "Wolf"
      },
      "answer": "B"
    },
    {
      "id": 6,
      "type": "image_multiple_choice",
      "difficulty": "medium",
      "question": "Identify the diagram.",
      "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
      "imageMime": "image/png",
      "options": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3",
        "D": "Option 4"
      },
      "answer": "A"
    },
    {
      "id": 7,
      "type": "matching",
      "difficulty": "hard",
      "pairs": {
        "Term 1": "Definition 1",
        "Term 2": "Definition 2"
      }
    }
  ]
}
```

## Disclaimer

Sharing a quiz makes it publicly available to anyone on the internet who has the link. Shared quizzes are stored in a personal Dropbox account and will be deleted 7 days after sharing. Do not upload sensitive or private content!!!