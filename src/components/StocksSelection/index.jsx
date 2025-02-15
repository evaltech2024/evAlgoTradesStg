import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonToast,
  IonLoading,
  IonItem,
  IonInput,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { lockClosed } from "ionicons/icons";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

const StockPicking = () => {
  const [user] = useAuthState(auth);
  const [aiStocks, setAiStocks] = useState(10);
  const [memeStocks, setMemeStocks] = useState(10);
  const [pennyStocks, setPennyStocks] = useState(30);
  const [otherStocks, setOtherStocks] = useState(50);
  const [interstedStocks, setInterstedStocks] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setOtherStocks(100 - (Number(aiStocks) + Number(memeStocks) + Number(pennyStocks)));
  }, [aiStocks, memeStocks, pennyStocks]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      try {
        const collectionRef = collection(db, 'userPref');
        const q = query(collectionRef, where("userID", "==", user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setAiStocks(data.aiStocks || 10);
          setMemeStocks(data.memeStocks || 10);
          setPennyStocks(data.pennyStocks || 30);
          setInterstedStocks(data.stockInterests || '');
          setOtherStocks(data.otherStocks || 50);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, [user]);

  const saveDetailsToFirestore = async () => {
    if (!aiStocks || !memeStocks || !pennyStocks || !interstedStocks) {
      setToastMessage('Please provide all stock preferences.');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error('No user logged in');

      const collectionRef = collection(db, 'userPref');
      const q = query(collectionRef, where("userID", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          aiStocks,
          memeStocks,
          pennyStocks,
          otherStocks,
          stockInterests: interstedStocks,
        });
        setToastMessage('Preferences saved successfully!');
      } else {
        setToastMessage('No matching documents found.');
      }
      setShowToast(true);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setToastMessage('Error saving preferences. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Stock Preferences</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>*Note: Max percentage of your account balance</p>
        <IonCard>
          <IonItem>
            <IonInput label="Inital Account Balance" type="number" placeholder="$ 100.00" disabled>
              <IonIcon slot="end" icon={lockClosed} aria-hidden="true"
                value={100}></IonIcon>
            </IonInput>
          </IonItem>
          <IonItem>
            <IonInput label="AI Stocks" type="number" placeholder="30"
              value={aiStocks}
              onIonChange={(e) => setAiStocks(e.detail.value)}></IonInput>
          </IonItem>
          <IonItem>
            <IonInput label="MEME Stocks" type="number" placeholder="10"
              value={memeStocks}
              onIonChange={(e) => setMemeStocks(e.detail.value)}></IonInput>
          </IonItem>
          <IonItem>
            <IonInput label="PENNY Stocks" type="number" placeholder="10"
              value={pennyStocks}
              onIonChange={(e) => setPennyStocks(e.detail.value)}></IonInput>
          </IonItem>
          <IonItem>
            <IonInput label="Other Stocks" type="number" placeholder="TSLA"
              value={otherStocks} disabled></IonInput>
          </IonItem>
          <IonItem>
            <IonInput label="Intersted Stocks" type="text" placeholder="TSLA"
              value={interstedStocks}
              onIonChange={(e) => setInterstedStocks(e.detail.value)}></IonInput>
          </IonItem>
          <IonLoading isOpen={loading} message="Submitting verification..." />
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={3000}
          />
        </IonCard>
        <IonButton expand="block" onClick={saveDetailsToFirestore}>
          Save
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default StockPicking;
