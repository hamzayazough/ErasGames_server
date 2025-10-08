import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../services/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user.enums';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminEmails: string[];

  constructor(
    private firebaseService: FirebaseService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Get admin emails from environment variable
    const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
    this.adminEmails = adminEmailsEnv
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const authHeader = request.headers.authorization;

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

      if (!decodedToken.email) {
        throw new UnauthorizedException(
          'Admin access requires a verified email address',
        );
      }

      const userEmail = decodedToken.email.toLowerCase();

      // Check if the email is in the admin list
      if (!this.adminEmails.includes(userEmail)) {
        throw new ForbiddenException(
          'Access denied: Admin privileges required',
        );
      }

      // Verify user exists in database and has admin role
      const user = await this.userRepository.findOne({
        where: {
          email: userEmail,
          id: decodedToken.uid,
        },
      });

      if (!user) {
        throw new ForbiddenException(
          'Access denied: Admin user not found in database',
        );
      }

      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Access denied: User does not have admin role',
        );
      }

      if (user.status !== 'active') {
        throw new ForbiddenException(
          'Access denied: Admin account is not active',
        );
      }

      // Add user data to request object for use in controllers
      request.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: (decodedToken.name as string) || undefined,
      };

      request.adminUser = {
        uid: user.id,
        email: user.email!,
        role: user.role,
      };

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        `Admin authentication failed: ${error.message}`,
      );
    }
  }
}
