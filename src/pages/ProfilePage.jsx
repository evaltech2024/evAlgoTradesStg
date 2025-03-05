import {
  IonContent,
  IonPage,
} from "@ionic/react";
import Profile from "../components/Profile";

const ProfilePage = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <Profile />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
