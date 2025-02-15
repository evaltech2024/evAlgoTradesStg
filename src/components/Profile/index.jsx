// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonAvatar,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonList,
} from '@ionic/react';
import {
  heartOutline,
  downloadOutline,
  languageOutline,
  locationOutline,
  contrastOutline,
  phonePortraitOutline,
  cardOutline,
  trashOutline,
  timeOutline,
  analyticsOutline,
  logOutOutline,
  settingsOutline, logoGoogle
} from 'ionicons/icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useHistory } from 'react-router-dom';
import { signInWithGoogle } from '../login/signInWithGoogle';

const ProfilePage = (props) => {
  const [isShowVerify, setIsShowVerify] = useState(true);
  const history = useHistory();
  const [user, loading] = useAuthState(auth);
  useEffect(() => {
    if (loading) return; // Do nothing while loading
    const fetchUser = async () => {
      const docRef = doc(db, "customUser", user.uid);
      const docSnap = await getDoc(docRef);
      if(docSnap.data().approvalStatus === 1){
        setIsShowVerify(false);
      }else{
        setIsShowVerify(true);
      }
    };
    fetchUser();
  }, [loading, user]);
  if (loading) {
    return <div>Loading...</div>;
  }
  const handleLogout = async () => {
    await auth.signOut().then(() => {
      history.push('/home');
    });
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>My Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/edit-profile">
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center">
          <IonAvatar style={{ width: '80px', height: '80px', margin: '0 auto' }}>
            <img src={user ? user.photoURL : "https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y"} alt="Profile" />
          </IonAvatar>
          <h2>{user?.displayName || 'Jhone Doe'}</h2>
          <p>{user?.email || 'jhonedoe@gmail.com'}</p>
          {/* <IonButton routerLink="/edit-profile">Edit Profile</IonButton> */}
        </div>
        {user === null ? <IonList>
          <IonItem button onClick={() => signInWithGoogle()}>
            <IonIcon icon={logoGoogle} slot="start" />
            <IonLabel>Sign with Google</IonLabel>
          </IonItem>
        </IonList> :
          <IonList>
            <IonItem button detail routerLink="/StockPicking">
              <IonIcon icon={analyticsOutline} slot="start" />
              <IonLabel>Stock Preferences</IonLabel>
            </IonItem>
            {isShowVerify && <IonItem button detail routerLink="/verify-profile">
              <IonIcon icon={timeOutline} slot="start" />
              <IonLabel>Verify Profiles</IonLabel>
            </IonItem>}
            <IonItem button detail onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" color="danger" />
              <IonLabel color="danger">Log Out</IonLabel>
            </IonItem>
          </IonList>}
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
