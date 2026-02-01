import { useEffect, useState } from 'react';
import Quiz from './components/Quiz';
import defaultQuizData from './quizData';

const STORAGE_KEY = 'uploadedQuizData';

const isValidQuizData = (data) => {
  return data && Array.isArray(data.questions) && data.questions.length > 0;
};

const parseQuizFile = async (file) => {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!isValidQuizData(parsed)) {
    throw new Error('Invalid quiz format. Expecting a JSON with a questions array.');
  }
  return parsed;
};

function App() {
  const [quizData, setQuizData] = useState(defaultQuizData);
  const [showUploader, setShowUploader] = useState(true);
  const [error, setError] = useState('');
  const [loadedName, setLoadedName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (isValidQuizData(parsed)) {
          setQuizData(parsed);
          setLoadedName(parsed.source || 'Uploaded JSON');
          setShowUploader(false);
          return;
        }
      } catch {
        // Ignore invalid storage and fall back to uploader
      }
    }
    setShowUploader(true);
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please upload a .json file.');
      return;
    }

    try {
      const parsed = await parseQuizFile(file);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setQuizData(parsed);
      setLoadedName(file.name);
      setError('');
      setShowUploader(false);
    } catch (err) {
      setError(err.message || 'Unable to read the quiz file.');
    }
  };

  const handleUseDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setQuizData(defaultQuizData);
    setLoadedName(defaultQuizData.source || 'Default quiz');
    setError('');
    setShowUploader(false);
  };

  const handleChangeQuiz = () => {
    setShowUploader(true);
  };

  const handleDownload = () => {
    const content = `const quizData = ${JSON.stringify(quizData, null, 2)};\n\nexport default quizData;\n`;
    const blob = new Blob([content], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quizData.js';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      {showUploader ? (
        <div className="upload-container">
          <div className="upload-card">
            <h1>Load Quiz Questions</h1>
            <p className="upload-subtitle">
              Upload a .json file with a <span>questions</span> array to start the quiz.
            </p>
            <label className="file-input">
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
              />
              <span>Choose JSON File</span>
            </label>
            {error && <p className="upload-error">{error}</p>}
            <div className="upload-actions">
              <button className="btn btn-secondary" onClick={handleUseDefault}>
                Use Default Quiz
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-wrapper">
          <div className="quiz-toolbar">
            <div className="quiz-toolbar-actions">
              <button className="btn btn-secondary" onClick={handleDownload}>
                Download quizData.json
              </button>
              <button className="btn btn-secondary" onClick={handleChangeQuiz}>
                Change Quiz File
              </button>
            </div>
          </div>
          <Quiz data={quizData} />
        </div>
      )}
    </div>
  )
}

export default App
