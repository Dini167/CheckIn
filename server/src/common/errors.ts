import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, code = 'BAD_REQUEST', details?: unknown) =>
  new AppError(400, code, message, details);
export const unauthorized = (message = 'נדרשת התחברות', code = 'UNAUTHORIZED') =>
  new AppError(401, code, message);
export const forbidden = (message = 'אין לך הרשאה לבצע פעולה זו') => new AppError(403, 'FORBIDDEN', message);
export const notFound = (message = 'המשאב המבוקש לא נמצא') => new AppError(404, 'NOT_FOUND', message);
export const conflict = (message: string, code = 'CONFLICT') => new AppError(409, code, message);

export function zodDetails(err: ZodError) {
  return err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `הכתובת ${req.method} ${req.path} לא קיימת`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof ZodError) {
    error = badRequest('הנתונים שנשלחו אינם תקינים', 'VALIDATION_ERROR', zodDetails(err));
  } else if (err instanceof multer.MulterError) {
    error =
      err.code === 'LIMIT_FILE_SIZE'
        ? new AppError(413, 'FILE_TOO_LARGE', 'הקובץ גדול מדי')
        : badRequest(`שגיאה בהעלאת הקובץ: ${err.message}`, 'UPLOAD_ERROR');
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    error = conflict('רשומה עם ערכים אלה כבר קיימת', 'DUPLICATE');
  } else if (err instanceof SyntaxError && 'body' in err) {
    error = badRequest('גוף הבקשה אינו JSON תקין', 'INVALID_JSON');
  } else if (typeof err?.status === 'number' && err.status >= 400 && err.status < 500) {
    error = new AppError(err.status, 'BAD_REQUEST', err.message);
  } else {
    console.error(err);
    error = new AppError(500, 'INTERNAL_ERROR', 'שגיאת שרת פנימית');
  }

  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  });
};
