// Header.jsx
import React from 'react';
import {
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonHeader
} from '@ionic/react';
import { personCircle, search } from 'ionicons/icons';

const Header = () => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="secondary">
          <IonButton href='/profile'>
            <IonIcon slot="icon-only" icon={personCircle}></IonIcon>
          </IonButton>
          <IonButton>
            <IonIcon slot="icon-only" icon={search}></IonIcon>
          </IonButton>
        </IonButtons>
        <IonTitle routerLink="/home" style={{ cursor: 'pointer' }}>EvAllGo</IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
