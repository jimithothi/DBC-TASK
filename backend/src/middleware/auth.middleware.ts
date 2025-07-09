import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate requests using JWT.
 * Extracts the token from the Authorization header, verifies it,
 * and attaches the decoded user information to the request object.
 * Responds with 401 if the token is missing or invalid.
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret', (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};