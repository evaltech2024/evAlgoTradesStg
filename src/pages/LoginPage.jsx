import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import LoginPage from '../components/login';
// import './Tab1.css';

const Tab1 = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <LoginPage />
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        {/* <ExploreContainer name="Tab 1 page" /> */}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
