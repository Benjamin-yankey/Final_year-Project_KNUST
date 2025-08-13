// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("AUTHENTICATING REQUEST", req.headers);
    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER", authHeader);
    if (!authHeader?.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log("AUTH HEADER SPLIT");
    const token = authHeader.split(' ')[1];
    console.log("TOKEN", token);
    let decoded;

    if(!token){
      console.log("MISSING TOKEN");
     return res.status(401).json({ message: 'Missing token' }); 
    }

    console.log("AUTHENTICATING WITH TOKEN", token);

    decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret') as JwtPayload;

    // Ensure decoded has the required shape
    if (!decoded.id) {
      console.log("INVALID TOKEN PAYLOAD", decoded);
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Add your role checking logic here
    // if (!roles.includes(req.user.role)) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    next();
  };
};


