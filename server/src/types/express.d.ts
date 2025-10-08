import { UserRole } from '../database/enums/user.enums';

export interface FirebaseUser {
  uid: string;
  email?: string;
  name?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: FirebaseUser;
      adminUser?: AdminUser;
      user?: any; // For authenticated user data
    }
  }
}
