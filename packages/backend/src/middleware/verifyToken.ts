import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export default function verifyToken(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ success: false, error: 'Токен не предоставлен' });
    return;
  }
  (req as AuthenticatedRequest).userId = token;
  next();
}