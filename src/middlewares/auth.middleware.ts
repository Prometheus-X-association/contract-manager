import { config } from 'config/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, config.auth.secret);
        req.user = decoded.user;
        return next();
      } catch (error) {
        return res.status(401).json({ msg: 'Invalid token.' });
      }
    }
  }
  return res.status(401).json({ msg: 'Authentication failed.' });
};

export const genToken = (user: any): string => {
  const payload = {
    user: {
      id: user.id,
      username: user.username,
    },
  };
  const token = jwt.sign(payload, config.auth.secret, {
    expiresIn: '4h',
  });
  return token;
};

interface Session {
  'contract-manager-session-cookie'?: string;
}
export const checkSessionCookie = (
  req: Request & { session: Session },
  res: Response,
  next: NextFunction,
) => {
  const cookies = req.headers.cookie || '';
  const cookieArray = cookies.split(';').map((cookie) => cookie.trim());
  const sessionCookie = cookieArray.find((cookie) =>
    cookie.startsWith('contract-manager-session-cookie='),
  );
  if (/*req.session && */ sessionCookie) {
    return next();
  }
  return res.status(401).json({ error: 'Session cookie is missing.' });
};
export default auth;
