import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log("authorizeRoles - Decoded User:", req.user);

    if (!req.user) {
      console.log("authorizeRoles - User not present in request");
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log("authorizeRoles - Role not allowed:", req.user.role);
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
      return;
    }

    console.log("authorizeRoles - Role authorized:", req.user.role);
    next();
  };
};
