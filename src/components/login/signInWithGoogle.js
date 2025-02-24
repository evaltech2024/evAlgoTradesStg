import { auth } from '../../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useHistory } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export function signInWithGoogle() {
  return new Promise(function(resolve, reject) {
    // if (Capacitor.isNativePlatform()) {
    //   // Mobile sign-in
    //   FirebaseAuthentication.signInWithGoogle()
    //     .then(function(result) {
    //       console.log("Logged in successfully", result.user);
    //       resolve(result.user);
    //     })
    //     .catch(function(error) {
    //       console.error("Error during login", error);
    //       reject(error);
    //     });
    // } else {
      // Web sign-in
      var provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then(function(result) {
          console.log("Logged in successfully", result.user);
          resolve(result.user);
        })
        .catch(function(error) {
          console.error("Error during login", error);
          reject(error);
        });
    // }
  });
}