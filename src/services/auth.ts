import { auth } from '@/config/firebase';
import {
  GoogleAuthProvider,
  User,
  UserCredential,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';

export const authService = {
  signUp: async (email: string, password: string): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return userCredential;
  },

  signIn: (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signInWithGoogle: async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  checkEmailExists: async (email: string): Promise<string[]> => {
    return fetchSignInMethodsForEmail(auth, email);
  },

  linkGoogleAccount: async (): Promise<UserCredential> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result;
  },

  linkEmailPassword: async (email: string, password: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
  },

  sendVerificationEmail: async (): Promise<void> => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
  },

  signOut: (): Promise<void> => {
    return signOut(auth);
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },
};
