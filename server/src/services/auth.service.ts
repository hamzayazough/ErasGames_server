import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { AuthProvider } from '../database/enums/user.enums';
import { AuthenticatedUserDto } from '../dto/auth.dto';

export interface FirebaseUserData {
  uid: string;
  email?: string;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async authenticate(
    firebaseUserData: FirebaseUserData,
  ): Promise<AuthenticatedUserDto> {
    const { uid, email, name } = firebaseUserData;

    // Check if user already exists by Firebase UID (which is now the primary key)
    let user = await this.userRepository.findOne({
      where: { id: uid },
    });

    // If user doesn't exist, create a new one
    if (!user) {
      try {
        user = await this.createUserFromFirebase(
          uid,
          email || null,
          name || null,
        );
      } catch (error) {
        // Handle race condition: if user was created by another request
        if (error.code === '23505' && error.constraint === 'users_pkey') {
          // User was created by another concurrent request, fetch it
          user = await this.userRepository.findOne({
            where: { id: uid },
          });
          if (!user) {
            throw new Error('Failed to retrieve user after duplicate key error');
          }
        } else {
          throw error;
        }
      }
    }

    // Return user information that the client needs
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      country: user.country,
      tz: user.tz,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  private async createUserFromFirebase(
    firebaseUid: string,
    email: string | null,
    name: string | null,
  ): Promise<User> {
    const user = this.userRepository.create({
      id: firebaseUid, // Set Firebase UID as the primary key
      authProvider: AuthProvider.FIREBASE,
      providerUserId: firebaseUid, // Keep this for consistency
      email,
      name,
      emailVerified: true, // Firebase tokens are only issued for verified emails
    });

    return await this.userRepository.save(user);
  }

  async findUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: firebaseUid }, // Simply search by ID since it's the Firebase UID
    });
  }
}
