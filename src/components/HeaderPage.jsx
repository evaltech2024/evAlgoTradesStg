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
import { personCircle, home } from 'ionicons/icons';

const Header = (props) => {
  const { customUser } = props;
  return (
    <IonHeader translucent>
      <IonToolbar>
        <IonButtons slot="secondary">
          <IonButton href='/profile'>
            <IonIcon slot="icon-only" icon={personCircle}></IonIcon>
          </IonButton>
          {customUser === 1 &&
          <IonButton href='/userHomePage'>
          <IonIcon slot="icon-only" icon={home}></IonIcon>
        </IonButton>}
        </IonButtons>
        <IonButton fill='clear' routerLink="/home" >EvALGO Trades</IonButton>
        {/* <IonTitle button routerLink="/home" style={{ cursor: 'pointer' }}>EvALGO Trades</IonTitle> */}
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
