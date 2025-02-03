import React, { useEffect, useState } from "react";
import {
  IonContent,IonText,
  IonPage,
  IonIcon,
  IonButton,
  IonButtons,
  IonTitle,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonHeader,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonItemSliding,
  IonLabel,
  IonList,
  IonSpinner,
  IonToolbar,
} from "@ionic/react";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebaseConfig";
import { pin, share, trash } from "ionicons/icons";
import "./Home.css";
import Header from "../components/HeaderPage";
import StockCard from "../components/TradingCards";
import NewHome from "../components/Home";

const Home = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [value, loading, error] = useCollection(collection(db, "activeTrades")); // Now it's safe to access value.docs 
  useEffect(() => {
    const fetchData = async () => {
      const activeTradesQuery = query(collection(db, "activeTrades"));
      const stockSnapshotQuery = query(collection(db, "stockSnapshot"));
      // const stockHistoryQuery = query(collection(db, "stockHistory"), orderBy("end", "desc"));
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      fiveDaysAgo.setHours(0, 0, 0, 0);
      const formattedDate = fiveDaysAgo.toISOString().split('T')[0] + ' 00:00';

      const stockHistoryQuery = query(
        collection(db, "stockHistory"),
        orderBy("end", "desc"),
        where("end", ">=", formattedDate)
      );
      const [activeTradesSnapshot, stockSnapshotSnapshot, stockHistorySnapshot] = await Promise.all([
        getDocs(activeTradesQuery),
        getDocs(stockSnapshotQuery),
        getDocs(stockHistoryQuery),
      ]);

      const activeTrades = activeTradesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const stockSnapshots = stockSnapshotSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const stockHistories = stockHistorySnapshot.docs.map((doc) => ({
        id: doc.id,
        date: new Date(doc.data().end),
        ...doc.data(),
      }));
      console.log(stockHistories);

      const combined = activeTrades.map((trade) => ({
        activeTrade: trade,
        stockSnapshot: stockSnapshots.find(
          (snapshot) => snapshot.symbol === trade.symbol
        ),
        stockHistory: stockHistories
          .filter((history) => history.symbol === trade.symbol)
          .sort((a, b) => new Date(b.date) - new Date(a.date)), // Sort stockHistory by end date in descending order
      }))
      .filter((item) => item.stockSnapshot) // Only include items that have matching data in all collections
      .sort((a, b) => {
        if (a.stockHistory.length === 0) return 1; // If a has no stockHistory, place it after b
        if (b.stockHistory.length === 0) return -1; // If b has no stockHistory, place it after a
        return new Date(b.stockHistory[0].date) - new Date(a.stockHistory[0].date); // Order by the most recent stockHistory end date
      });// Order by the most recent stockHistory end date
      console.log(combined);
      setCombinedData(combined);
    };

    fetchData();
  }, []);
  if (error) {
    return <strong>Error: {JSON.stringify(error)}</strong>;
  }

  if (loading) {
    return <IonSpinner />;
  }

  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <IonCard className="balance-card">
          <IonCardContent className="Today-Stock-info">
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Total Trades</IonText>
              <IonText className="Today-Stock-details-value">10</IonText>
            </div>
            <div className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Gain</IonText>
              <IonText className="Today-Stock-details-value">400 %</IonText>
            </div>
          </IonCardContent>
        </IonCard>
        <div>
          {combinedData && combinedData.length > 0 ? (
            combinedData.map((doc) => (
              <div key={doc.activeTrade.id}>
                {/* Access document data here */}
                <StockCard StockData={doc} />
              </div>
            ))
          ) : (
            <p>No active trades found.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
