import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Tags every request with an id and logs method, path, status and duration on
 * completion. The id makes a single request traceable across log lines.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  req.id = randomUUID();
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${req.id}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });

  next();
}
