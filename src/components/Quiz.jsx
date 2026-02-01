import { useEffect, useMemo, useState } from 'react';
import { CompleteSentence, FillInTheBlank, Matching, MultipleChoice, MultipleChoiceMultipleAnswers } from './QuestionTypes';
import './Quiz.css';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Quiz({ data }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const sourceQuestions = Array.isArray(data?.questions) ? data.questions : [];

  const questions = useMemo(() => {
    const shuffled = shuffleArray(sourceQuestions);
    return shuffled.map((q, index) => ({
      ...q,
      originalId: q.id,
      id: index + 1,
    }));
  }, [sourceQuestions]);
  const question = questions[currentQuestion];

  useEffect(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setSubmittedAnswers({});
  }, [data]);

  const handleAnswer = (questionId, value, term = null) => {
    if (question.type === 'matching') {
      setAnswers({
        ...answers,
        [questionId]: {
          ...answers[questionId],
          [term]: value,
        },
      });
      return;
    }

    if (question.type === 'multiple_choice_multiple_answers') {
      const previous = Array.isArray(answers[questionId]) ? answers[questionId] : [];
      const updated = previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value];

      setAnswers({
        ...answers,
        [questionId]: updated,
      });
      return;
    }

    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSubmittedAnswers({});
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];

      if (q.type === 'multiple_choice') {
        if (userAnswer === q.answer) {
          correct++;
        }
      } else if (q.type === 'multiple_choice_multiple_answers') {
        const normalized = Array.isArray(userAnswer) ? userAnswer : [];
        const correctAnswers = Array.isArray(q.answers) ? q.answers : [];
        if (normalized.length === correctAnswers.length) {
          const userSet = new Set(normalized);
          if (correctAnswers.every((answer) => userSet.has(answer))) {
            correct++;
          }
        }
      } else if (q.type === 'fill_in_the_blank' || q.type === 'complete_sentence') {
        if (userAnswer && userAnswer.toLowerCase() === q.answer.toLowerCase()) {
          correct++;
        }
      } else if (q.type === 'matching') {
        let allCorrect = true;
        for (const term in q.pairs) {
          if (userAnswer?.[term] !== q.pairs[term]) {
            allCorrect = false;
            break;
          }
        }
        if (allCorrect && userAnswer && Object.keys(userAnswer).length === Object.keys(q.pairs).length) {
          correct++;
        }
      }
    });

    return correct;
  };

  const isAnswerCorrect = (q, userAnswer) => {
    if (q.type === 'multiple_choice') {
      return userAnswer === q.answer;
    } else if (q.type === 'multiple_choice_multiple_answers') {
      const normalized = Array.isArray(userAnswer) ? userAnswer : [];
      const correctAnswers = Array.isArray(q.answers) ? q.answers : [];
      if (normalized.length !== correctAnswers.length) {
        return false;
      }
      const userSet = new Set(normalized);
      return correctAnswers.every((answer) => userSet.has(answer));
    } else if (q.type === 'fill_in_the_blank' || q.type === 'complete_sentence') {
      return userAnswer && userAnswer.toLowerCase() === q.answer.toLowerCase();
    } else if (q.type === 'matching') {
      let allCorrect = true;
      for (const term in q.pairs) {
        if (userAnswer?.[term] !== q.pairs[term]) {
          allCorrect = false;
          break;
        }
      }
      return allCorrect && userAnswer && Object.keys(userAnswer).length === Object.keys(q.pairs).length;
    }
    return false;
  };

  const handleSubmitAnswer = () => {
    setSubmittedAnswers({
      ...submittedAnswers,
      [question.id]: true,
    });
  };

  const isAnswerProvided = (q, userAnswer) => {
    if (q.type === 'multiple_choice_multiple_answers') {
      return Array.isArray(userAnswer) && userAnswer.length > 0;
    }
    return Boolean(userAnswer);
  };

  if (!questions.length) {
    return (
      <div className="quiz-container">
        <div className="results-container">
          <h1>No Questions Found</h1>
          <p className="result-message">Upload a valid quiz file to begin.</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="quiz-container">
        <div className="results-container">
          <h1>Quiz Completed!</h1>
          <div className="score-display">
            <div className="score-number">{score}</div>
            <div className="score-text">out of {questions.length}</div>
          </div>
          <div className="percentage">
            {percentage}% Correct
          </div>
          <p className="result-message">
            {percentage >= 80 && "Excellent work! You've mastered this quiz."}
            {percentage >= 60 && percentage < 80 && "Great job! You're doing well."}
            {percentage >= 40 && percentage < 60 && "Good effort! You can do better with more practice."}
            {percentage < 40 && "Keep practicing! Review the material and try again."}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setCurrentQuestion(0);
              setAnswers({});
              setShowResults(false);
            }}
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>Quiz</h1>
        <div className="progress">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="difficulty-badge" data-difficulty={question.difficulty}>
        {question.difficulty}
      </div>

      {question.type === 'multiple_choice' && (
        <MultipleChoice
          question={question}
          onAnswer={(value) => handleAnswer(question.id, value)}
          selectedAnswer={answers[question.id]}
        />
      )}

      {question.type === 'multiple_choice_multiple_answers' && (
        <MultipleChoiceMultipleAnswers
          question={question}
          onAnswer={(value) => handleAnswer(question.id, value)}
          selectedAnswers={answers[question.id] || []}
        />
      )}

      {question.type === 'fill_in_the_blank' && (
        <FillInTheBlank
          question={question}
          onAnswer={(value) => handleAnswer(question.id, value)}
          selectedAnswer={answers[question.id]}
        />
      )}

      {question.type === 'complete_sentence' && (
        <CompleteSentence
          question={question}
          onAnswer={(value) => handleAnswer(question.id, value)}
          selectedAnswer={answers[question.id]}
        />
      )}

      {question.type === 'matching' && (
        <Matching
          question={question}
          onAnswer={(term, value) => handleAnswer(question.id, value, term)}
          selectedAnswers={answers[question.id] || {}}
        />
      )}

      {submittedAnswers[question.id] && (
        <div className={`feedback-container ${isAnswerCorrect(question, answers[question.id]) ? 'correct' : 'incorrect'}`}>
          <div className="feedback-header">
            {isAnswerCorrect(question, answers[question.id]) ? (
              <span className="feedback-status correct-status">✓ Correct!</span>
            ) : (
              <span className="feedback-status incorrect-status">✗ Incorrect</span>
            )}
          </div>
          {!isAnswerCorrect(question, answers[question.id]) && (
            <div className="feedback-answer">
              <p><strong>Correct Answer:</strong></p>
              {question.type === 'multiple_choice' && (
                <p>{question.options[question.answer]} ({question.answer})</p>
              )}
              {question.type === 'multiple_choice_multiple_answers' && (
                <div>
                  {question.answers.map((answerKey) => (
                    <p key={answerKey}>{question.options[answerKey]} ({answerKey})</p>
                  ))}
                </div>
              )}
              {question.type === 'fill_in_the_blank' && (
                <p>{question.answer}</p>
              )}
              {question.type === 'complete_sentence' && (
                <p>{question.answer}</p>
              )}
              {question.type === 'matching' && (
                <div className="matching-feedback">
                  {Object.entries(question.pairs).map(([term, definition]) => (
                    <div key={term} className="pair-feedback">
                      <span className="term">{term}</span>
                      <span className="arrow">→</span>
                      <span className="definition">{definition}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="quiz-buttons">
        {!submittedAnswers[question.id] ? (
          <button 
            className="btn btn-primary"
            onClick={handleSubmitAnswer}
            disabled={!isAnswerProvided(question, answers[question.id])}
          >
            Submit Answer
          </button>
        ) : (
          <>
            <button 
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleNext}
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
