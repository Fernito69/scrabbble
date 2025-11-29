import { auth } from '@/config/firebase';
import {
  GoogleAuthProvider,
  User,
  UserCredential,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';

export const authService = {
  // signUp: (email: string, password: string): Promise<UserCredential> => {
  //   return createUserWithEmailAndPassword(auth, email, password);
  // },

  // signIn: (email: string, password: string): Promise<UserCredential> => {
  //   return signInWithEmailAndPassword(auth, email, password);
  // },

  signInWithGoogle: (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
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
