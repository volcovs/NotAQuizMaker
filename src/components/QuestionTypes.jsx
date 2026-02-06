import './QuestionTypes.css';

export const MultipleChoice = ({ question, onAnswer, selectedAnswer }) => {
  return (
    <div className="question-container">
      <h3>{question.question}</h3>
      <div className="options">
        {Object.entries(question.options).map(([key, value]) => (
          <label key={key} className="option">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={key}
              checked={selectedAnswer === key}
              onChange={(e) => onAnswer(e.target.value)}
            />
            <span className="option-text">{key}: {value}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const ImageMultipleChoice = ({ question, onAnswer, selectedAnswer }) => {
  return (
    <div className="question-container">
      <h3>{question.question}</h3>
      {question.imageUrl && (
        <img
          className="question-image"
          src={question.imageUrl}
          alt={question.imageAlt || 'Question illustration'}
          loading="lazy"
        />
      )}
      <div className="options">
        {Object.entries(question.options).map(([key, value]) => (
          <label key={key} className="option">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={key}
              checked={selectedAnswer === key}
              onChange={(e) => onAnswer(e.target.value)}
            />
            <span className="option-text">{key}: {value}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const MultipleChoiceMultipleAnswers = ({ question, onAnswer, selectedAnswers }) => {
  const selectedSet = new Set(selectedAnswers || []);

  return (
    <div className="question-container">
      <h3>{question.question}</h3>
      <div className="options">
        {Object.entries(question.options).map(([key, value]) => (
          <label key={key} className="option">
            <input
              type="checkbox"
              name={`question-${question.id}`}
              value={key}
              checked={selectedSet.has(key)}
              onChange={(e) => onAnswer(e.target.value)}
            />
            <span className="option-text">{key}: {value}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const FillInTheBlank = ({ question, onAnswer, selectedAnswer }) => {
  return (
    <div className="question-container">
      <h3>{question.question}</h3>
      <input
        type="text"
        placeholder="Enter your answer"
        value={selectedAnswer || ''}
        onChange={(e) => onAnswer(e.target.value)}
        className="text-input"
      />
    </div>
  );
};

export const CompleteSentence = ({ question, onAnswer, selectedAnswer }) => {
  return (
    <div className="question-container">
      <h3>{question.question}</h3>
      <input
        type="text"
        placeholder="Enter your answer"
        value={selectedAnswer || ''}
        onChange={(e) => onAnswer(e.target.value)}
        className="text-input"
      />
    </div>
  );
};

export const Matching = ({ question, onAnswer, selectedAnswers }) => {
  const pairKeys = Object.keys(question.pairs);
  const pairValues = Object.values(question.pairs);

  return (
    <div className="question-container">
      <h3>{question.question}</h3>
      <div className="matching-container">
        <div className="matching-left">
          {pairKeys.map((term) => (
            <div key={term} className="matching-term">
              {term}
            </div>
          ))}
        </div>
        <div className="matching-right">
          {pairKeys.map((term) => (
            <select
              key={`select-${term}`}
              value={selectedAnswers[term] || ''}
              onChange={(e) => onAnswer(term, e.target.value)}
              className="matching-select"
            >
              <option value="">-- Select --</option>
              {pairValues.map((definition) => (
                <option key={definition} value={definition}>
                  {definition}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    </div>
  );
};
