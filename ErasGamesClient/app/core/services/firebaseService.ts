import {FirebaseApp, initializeApp} from '@react-native-firebase/app';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

class FirebaseService {
  private app: FirebaseApp | null = null;

  /**
   * Initialize Firebase
   */
  public async initialize(): Promise<void> {
    try {
      // Firebase should auto-initialize with the config files
      // but we can explicitly initialize if needed
      this.app = initializeApp();
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  /**
   * Get the current user
   */
  public getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Sign up with email and password
   */
  public async signUp(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      console.log('User signed up successfully:', userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  public async signIn(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      console.log('User signed in successfully:', userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  public async signOut(): Promise<void> {
    try {
      await auth().signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Listen to authentication state changes
   */
  public onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void,
  ): () => void {
    return auth().onAuthStateChanged(callback);
  }

  /**
   * Update user profile
   */
  public async updateProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      await user.updateProfile(updates);
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  public async deleteAccount(): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      await user.delete();
      console.log('User account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
