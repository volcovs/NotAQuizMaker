import { Dropbox } from 'dropbox';

const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
const BASE_PATH = process.env.DROPBOX_BASE_PATH || '/quizzes';

const isValidQuizData = (data) => {
  return data && Array.isArray(data.questions) && data.questions.length > 0;
};

const isValidQuizId = (quizId) => /^[A-Za-z0-9]{16}$/.test(quizId);

const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 16; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const uploadWithUniqueId = async (dropbox, payload) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = generateId();
    const path = `${BASE_PATH}/${id}.json`;
    try {
      await dropbox.filesUpload({
        path,
        contents: JSON.stringify(payload, null, 2),
        mode: { '.tag': 'add' },
      });
      return { id, path };
    } catch (error) {
      const tag = error?.error?.error?.['.tag'];
      if (tag === 'path' || tag === 'path_conflict') {
        continue;
      }
      throw error;
    }
  }
  throw new Error('Unable to allocate a unique quiz id.');
};

const parseIdFromPath = (path) => {
  const parts = path.split('/').filter(Boolean);
  const quizIndex = parts.lastIndexOf('quiz');
  if (quizIndex !== -1 && parts[quizIndex + 1]) {
    return parts[quizIndex + 1];
  }
  return null;
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (!ACCESS_TOKEN) {
    return jsonResponse(500, { error: 'Missing DROPBOX_ACCESS_TOKEN.' });
  }

  const dropbox = new Dropbox({ accessToken: ACCESS_TOKEN });

  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON body.' });
    }

    if (!isValidQuizData(payload)) {
      return jsonResponse(400, { error: 'Invalid quiz format.' });
    }

    try {
      const { id, path } = await uploadWithUniqueId(dropbox, payload);
      return jsonResponse(200, { id, path });
    } catch {
      return jsonResponse(500, { error: 'Failed to store quiz in Dropbox.' });
    }
  }

  if (event.httpMethod === 'GET') {
    const quizId = event.pathParameters?.id || parseIdFromPath(event.path || '');
    if (!quizId || !isValidQuizId(quizId)) {
      return jsonResponse(400, { error: 'Invalid quiz id.' });
    }

    try {
      const path = `${BASE_PATH}/${quizId}.json`;
      const download = await dropbox.filesDownload({ path });
      const fileBinary = download.result.fileBinary;
      if (!fileBinary) {
        return jsonResponse(404, { error: 'Quiz not found.' });
      }

      const content = Buffer.isBuffer(fileBinary)
        ? fileBinary.toString('utf-8')
        : Buffer.from(fileBinary).toString('utf-8');
      const parsed = JSON.parse(content);
      return jsonResponse(200, parsed);
    } catch {
      return jsonResponse(404, { error: 'Quiz not found.' });
    }
  }

  return jsonResponse(405, { error: 'Method not allowed.' });
};
