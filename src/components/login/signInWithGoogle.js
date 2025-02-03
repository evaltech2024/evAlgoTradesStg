import { auth } from '../../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useHistory } from 'react-router-dom';

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((result) => {
      // Handle successful login
      console.log("Logged in successfully", result.user);
    })
    .catch((error) => {
      // Handle errors
      console.error("Error during login", error);
    });
};