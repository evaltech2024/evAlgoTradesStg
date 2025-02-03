import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonLoading, IonIcon } from '@ionic/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { logoGoogle } from 'ionicons/icons';
import { auth } from '../../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useHistory } from 'react-router-dom';
import { signInWithGoogle } from './signInWithGoogle';
// import { auth } from './firebaseConfig';

const LoginPage = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={signInWithGoogle}>
          <IonIcon slot="start" icon={logoGoogle} />
          Sign in with Google
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
