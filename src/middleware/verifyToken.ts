import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/authTypes';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  console.log("verifyToken - Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("verifyToken - No token provided");
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.log("verifyToken - JWT secret not configured");
    res.status(500).json({ message: 'JWT secret is not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    console.log("verifyToken - Token verified:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("verifyToken - JWT verification failed:", error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
