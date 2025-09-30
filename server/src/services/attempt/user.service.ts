import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { AuthProvider } from '../../database/enums/user.enums';

// Extended Request interface with Firebase user
export interface FirebaseUser {
  uid: string;
  email?: string;
  name?: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find or create a user from Firebase authentication
   */
  async findOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    if (!firebaseUser) {
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = firebaseUser.uid;

    // Find existing user
    let user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      this.logger.log(`Creating new user with Firebase UID: ${userId}`);
      user = this.userRepository.create({
        id: userId,
        email: firebaseUser.email || null,
        name: firebaseUser.name || 'User',
        handle: `user_${userId.slice(0, 8)}`,
        authProvider: AuthProvider.FIREBASE,
        providerUserId: userId,
      });
      await this.userRepository.save(user);
      this.logger.log(`New user created successfully: ${userId}`);
    }

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}