import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface FirebaseUser {
  uid: string;
  email?: string;
  name?: string;
}

export const FirebaseUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FirebaseUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.firebaseUser!;
  },
);
