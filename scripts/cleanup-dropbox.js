import { Dropbox } from 'dropbox';

const DAYS_TO_KEEP = 7;
const BASE_PATH = process.env.DROPBOX_BASE_PATH || '/quizzes';
const APP_ID = process.env.DROPBOX_APP_ID;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const DRY_RUN = String(process.env.DRY_RUN || '').toLowerCase() === 'true';

if (!APP_ID || !APP_SECRET || !REFRESH_TOKEN) {
  console.error('Missing Dropbox OAuth configuration.');
  process.exit(1);
}

const dropbox = new Dropbox({
  clientId: APP_ID,
  clientSecret: APP_SECRET,
  refreshToken: REFRESH_TOKEN,
});

const cutoffMs = Date.now() - DAYS_TO_KEEP * 24 * 60 * 60 * 1000;

const shouldDelete = (entry) => {
  if (entry['.tag'] !== 'file') {
    return false;
  }
  if (!entry.name?.toLowerCase().endsWith('.json')) {
    return false;
  }
  const baseName = entry.name.replace(/\.json$/i, '');
  if (!/^[A-Za-z0-9]{16}$/.test(baseName)) {
    return false;
  }
  const modified = entry.server_modified ? new Date(entry.server_modified).getTime() : null;
  return modified !== null && modified < cutoffMs;
};

const listAll = async (path) => {
  const allEntries = [];
  let response = await dropbox.filesListFolder({ path, recursive: true });
  allEntries.push(...response.result.entries);

  while (response.result.has_more) {
    response = await dropbox.filesListFolderContinue({ cursor: response.result.cursor });
    allEntries.push(...response.result.entries);
  }

  return allEntries;
};

const deleteFile = async (path) => {
  if (DRY_RUN) {
    console.log(`[dry-run] delete ${path}`);
    return;
  }
  await dropbox.filesDeleteV2({ path });
  console.log(`deleted ${path}`);
};

const run = async () => {
  console.log(`Scanning Dropbox folder ${BASE_PATH} for files older than ${DAYS_TO_KEEP} days.`);
  const entries = await listAll(BASE_PATH);
  const toDelete = entries.filter(shouldDelete);

  if (!toDelete.length) {
    console.log('No expired files found.');
    return;
  }

  console.log(`Found ${toDelete.length} expired file(s).`);
  for (const entry of toDelete) {
    await deleteFile(entry.path_lower);
  }
};

run().catch((error) => {
  console.error('Cleanup failed:', error?.message || error);
  process.exit(1);
});
