// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { 
        id: string;
        // Add other user properties you need
        username?: string;
        email?: string;
      };
    }
  }
}