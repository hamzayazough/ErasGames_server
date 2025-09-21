import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthenticatedUserDto } from '../dto/auth.dto';
import { FirebaseUser } from '../decorators/firebase-user.decorator';
import type { FirebaseUser as FirebaseUserType } from '../decorators/firebase-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticate(
    @FirebaseUser() firebaseUser: FirebaseUserType,
  ): Promise<AuthenticatedUserDto> {
    return await this.authService.authenticate(firebaseUser);
  }
}
