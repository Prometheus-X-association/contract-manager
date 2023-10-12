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

/*
export const pip = (req: Request, res: Response, next: NextFunction) => {
  const userPolicies = pipService.getUserPolicyFromSession(req);
  if (!userPolicies) {
    const newUserPolicy = pipService.buildAuthenticationPolicy(req);
    pipService.setUserPolicyToSession(req, newUserPolicy);
  }
  next();
};
*/

export default auth;
