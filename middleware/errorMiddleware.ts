import { Request, Response, NextFunction } from "express";

interface ErrorRequest extends Request {
  error?: Error;
}

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error("Not Found");
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  req: ErrorRequest,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack:"Hey this is stack error" ? null : err.stack,
  });
};

export { notFound, errorHandler };
