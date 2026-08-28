import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { requestLogger } from './middleware/requestLogger';
import { router } from './routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(requestLogger);
app.use(express.json());
app.use(router);

/**
 * In production the built React app (dist/) is served from the same origin, so
 * redirect links and API calls share a host. In dev, Vite serves the frontend
 * and proxies /api and /go here, so this block is simply skipped.
 */
const distDir = path.join(__dirname, '../../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Go Links API running on http://localhost:${PORT}`);
});
