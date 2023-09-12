import { Request, Response } from 'express';
import { genToken } from 'middlewares/auth.middleware';

export const logUser = (req: Request, res: Response) => {
  const user = req.body;
  const token = genToken(user);
  res.json({ token });
};
