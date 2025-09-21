import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebase.service';

// Extend Express Request interface to include Firebase user data
declare module 'express-serve-static-core' {
  interface Request {
    firebaseUser?: {
      uid: string;
      email?: string;
      name?: string;
    };
  }
}

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  constructor(private firebaseService: FirebaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'Missing or invalid Authorization header',
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        throw new UnauthorizedException('Missing Firebase token');
      }

      // Verify the Firebase token
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      // Add Firebase user data to request object
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: (decodedToken.email as string) || undefined,
        name: (decodedToken.name as string) || undefined,
      };

      next();
    } catch (error) {
      throw new UnauthorizedException(
        `Firebase authentication failed: ${error.message}`,
      );
    }
  }
}
