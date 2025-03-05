// src/pages/EditProfilePage.jsx
import React, { useState } from 'react';
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
  IonInput,
  IonSelect,
  IonIcon,
  IonSelectOption,
  IonButton,
} from '@ionic/react';
import { checkmark } from 'ionicons/icons';

const EditProfilePage = () => {
  const [firstName, setFirstName] = useState('Jhonson');
  const [lastName, setLastName] = useState('King');
  const [phone, setPhone] = useState('+91 689 7852');
  const [email, setEmail] = useState('jhonking@gmail.com');
  const [gender, setGender] = useState('');

  const handleSave = () => {
    // Implement save logic here
    console.log('Profile saved');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Edit Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              <IonIcon icon={checkmark} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center">
          <IonAvatar style={{ width: '80px', height: '80px', margin: '0 auto' }}>
            <img src="https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y" alt="Profile" />
          </IonAvatar>
        </div>

        <h2 className="ion-padding-top">Your Information</h2>

        <IonItem>
          <IonLabel position="floating">First name</IonLabel>
          <IonInput value={firstName} onIonChange={e => setFirstName(e.detail.value)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Last name</IonLabel>
          <IonInput value={lastName} onIonChange={e => setLastName(e.detail.value)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Phone</IonLabel>
          <IonInput value={phone} onIonChange={e => setPhone(e.detail.value)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Email Id</IonLabel>
          <IonInput value={email} onIonChange={e => setEmail(e.detail.value)} type="email" />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Gender</IonLabel>
          <IonSelect value={gender} onIonChange={e => setGender(e.detail.value)}>
            <IonSelectOption value="male">Male</IonSelectOption>
            <IonSelectOption value="female">Female</IonSelectOption>
            <IonSelectOption value="other">Other</IonSelectOption>
          </IonSelect>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default EditProfilePage;
