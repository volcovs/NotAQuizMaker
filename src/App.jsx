import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import logo from './assets/logo.svg';
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
  const { id: routeQuizId } = useParams();
  const location = useLocation();
  const [quizData, setQuizData] = useState(defaultQuizData);
  const [showUploader, setShowUploader] = useState(true);
  const [error, setError] = useState('');
  const [loadedName, setLoadedName] = useState('');
  const [dropboxLink, setDropboxLink] = useState('');
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const extractQuizId = (input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('Please enter a quiz link or ID.');
    }

    const idRegex = /^[A-Za-z0-9]{16}$/;

    try {
      const url = new URL(trimmed);
      const queryId = url.searchParams.get('quiz');
      if (queryId && idRegex.test(queryId)) {
        return queryId;
      }
      const parts = url.pathname.split('/').filter(Boolean);
      const qIndex = parts.indexOf('q');
      if (qIndex !== -1 && parts[qIndex + 1] && idRegex.test(parts[qIndex + 1])) {
        return parts[qIndex + 1];
      }
    } catch {
      if (idRegex.test(trimmed)) {
        return trimmed;
      }
    }

    if (idRegex.test(trimmed)) {
      return trimmed;
    }

    throw new Error('Invalid quiz link or ID.');
  };

  const loadQuizById = async (quizId) => {
    setError('');
    setIsLoadingLink(true);
    try {
      const response = await fetch(`/api/quiz/${quizId}`);
      if (!response.ok) {
        throw new Error('Unable to fetch the quiz. Check that the link is valid.');
      }
      const parsed = await response.json();
      if (!isValidQuizData(parsed)) {
        throw new Error('Invalid quiz format. Expecting a JSON with a questions array.');
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setQuizData(parsed);
      setLoadedName('Shared quiz');
      setShowUploader(false);
    } catch (err) {
      setError(err.message || 'Unable to load the quiz.');
    } finally {
      setIsLoadingLink(false);
    }
  };

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

  useEffect(() => {
    if (routeQuizId && /^[A-Za-z0-9]{16}$/.test(routeQuizId)) {
      setDropboxLink(routeQuizId);
      loadQuizById(routeQuizId);
      return;
    }

    const params = new URLSearchParams(location.search);
    const link = params.get('quiz');
    if (link) {
      setDropboxLink(link);
      try {
        const quizId = extractQuizId(link);
        loadQuizById(quizId);
      } catch (err) {
        setError(err.message || 'Invalid quiz link or ID.');
      }
    }
  }, [location.search, routeQuizId]);

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

  const handleLoadDropboxLink = async () => {
    try {
      const quizId = extractQuizId(dropboxLink);
      await loadQuizById(quizId);
    } catch (err) {
      setError(err.message || 'Invalid quiz link or ID.');
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

  const handleShareQuiz = async () => {
    setIsSharing(true);
    setShareError('');
    setShareCopied(false);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error('Unable to share the quiz.');
      }

      const result = await response.json();
      if (!result?.id) {
        throw new Error('Share ID was not returned.');
      }

      const baseUrl = `${window.location.origin}`;
      const appLink = `${baseUrl}/q/${result.id}`;
      setShareLink(appLink);
    } catch (err) {
      setShareError(err.message || 'Unable to share the quiz.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareCopied(false);
    }
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
            <div className="app-brand">
              <img className="app-logo" src={logo} alt="Quiz app logo" />
              <h1>Load Quiz Questions</h1>
            </div>
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
            <div className="or-separator">or</div>
            <div className="link-input-row">
              <input
                type="url"
                className="link-input"
                placeholder="Paste quiz link or ID"
                value={dropboxLink}
                onChange={(event) => setDropboxLink(event.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={handleLoadDropboxLink}
                disabled={isLoadingLink}
              >
                {isLoadingLink ? 'Loading...' : 'Load Link'}
              </button>
            </div>
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
            <div className="quiz-toolbar-brand">
              <img className="app-logo app-logo--small" src={logo} alt="Quiz app logo" />
            </div>
            <div className="quiz-toolbar-actions">
              <button className="btn btn-secondary" onClick={handleDownload}>
                Download quizData.json
              </button>
              <button className="btn btn-secondary" onClick={handleChangeQuiz}>
                Change Quiz File
              </button>
            </div>
            <div className="quiz-toolbar-right">
              <button
                className="btn btn-primary"
                onClick={handleShareQuiz}
                disabled={isSharing}
              >
                {isSharing ? 'Sharing...' : 'Share Quiz'}
              </button>
            </div>
          </div>
          {shareError && (
            <div className="share-error">{shareError}</div>
          )}
          {shareLink && (
            <div className="share-panel">
              <div className="share-label">Share link</div>
              <div className="share-row">
                <input className="share-input" value={shareLink} readOnly />
                <button className="btn btn-secondary" onClick={handleCopyShareLink}>
                  {shareCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          <Quiz data={quizData} />
        </div>
      )}
    </div>
  )
}

export default App
