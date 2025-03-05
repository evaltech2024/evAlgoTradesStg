import { auth } from '../../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { saveUserInfo, saveAuthToken } from '../../utils/storage';

export async function signInWithGoogle() {
  if (Capacitor.isNativePlatform()) {
    try {
      // This uses the @capacitor-firebase/authentication plugin
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log('Mobile sign-in successful', result);
      // Save user info to preferences
      if (result.user) {
        // Extract necessary user info
        const userToSave = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        };
        console.log('User to save:', userToSave);
        // Save user info
        await saveUserInfo(userToSave);
      }

      return result.user;
    } catch (error) {
      console.error('Mobile sign-in error', error);
      throw error;
    }
  } else {
    // Web sign-in (unchanged)
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Web sign-in successful', result.user);
      // Save user info to preferences
      if (result.user) {
        // Extract necessary user info
        const userToSave = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        };
        
        // Save user info
        await saveUserInfo(userToSave);
      }
      return result.user;
    } catch (error) {
      console.error('Web sign-in error', error);
      throw error;
    }
  }
}