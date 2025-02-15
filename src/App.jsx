import React, { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, person, settings,  ellipsisHorizontal, ellipsisVertical, personCircle, search  } from 'ionicons/icons';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebaseConfig';
import HomePage from './pages/HomePage.jsx';
import UserHomePage from './components/Home';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TradeHistory from './components/tradeHistory';
import Header from './components/HeaderPage.jsx';
import Layout from './components/Layout.jsx';
import StockPicking from './components/StocksSelection';
import UserTradingHistory from './components/UserTradingHistory';
import EditProfilePage from './components/Profile/EditProfilePage.jsx';
import VerifyProfilePage from './components/Profile/VerifyProfilePage.jsx';
import { db } from "./firebaseConfig";
import { collection, query, getDoc, orderBy, where, doc } from "firebase/firestore";
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App = () => {
  const [user] = useAuthState(auth);
  const [customUser, setCustomUser] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchCustomUser = async () => {
        const userDocRef = doc(collection(db, 'customUser'), user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists) {
          setCustomUser(userDoc.data().approvalStatus);
        }
      };
      fetchCustomUser();
    }
  }, [user]);
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home" render={() => <HomePage  customUser={customUser}/>} />
          <Route exact path="/userHomePage" render={() => <UserHomePage />} />
          <Route exact path="/UserTradingHistory" render={() => <UserTradingHistory />} />
          <Route exact path="/profile" render={() => <ProfilePage />} />
          <Route exact path="/login" render={() => <LoginPage />} />
          <Route path="/edit-profile" render={()=> <EditProfilePage />} exact />
          <Route path="/verify-profile" render={()=> <VerifyProfilePage/>} exact />
          <Route path="/StockPicking" render={()=> <StockPicking/>} exact />
          <Route path="/TradeHistory" render={()=> <TradeHistory/>} exact />
          <Route exact path="/">
            {customUser === 0 && <Redirect to="/home" />}
            {customUser === 1 && <Redirect to="/userHomePage" />}
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
