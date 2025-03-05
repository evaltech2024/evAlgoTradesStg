// src/components/Layout.jsx
import React, { useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Header from './HeaderPage';

const Layout = ({ children }) => {
    // useEffect(() => {
    //     console.log(window.location.pathname);
    // }, [window.location.pathname]);
    // console.log(window.location.pathname);
  return (
    <IonPage>
      {window.location.pathname === '/home' && <Header />}
      <IonContent>
        {children}
      </IonContent>
    </IonPage>
  );
};

export default Layout;
