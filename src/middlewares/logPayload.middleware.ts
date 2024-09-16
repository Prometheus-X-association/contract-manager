import { Request, Response, NextFunction } from 'express';
import { logger } from 'utils/logger';

export const logPayloadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(JSON.stringify(req.body, null, 2));

  next();
};
