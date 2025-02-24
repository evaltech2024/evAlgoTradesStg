import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonIcon,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonFooter,
  IonToolbar, IonText,
  IonButton,
} from '@ionic/react';
import { notificationsOutline, chevronForwardOutline, homeOutline, documentTextOutline, swapVerticalOutline, timeOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from "../../firebaseConfig";
import firebase from 'firebase/compat/app';
import UserStockCard from "../UserTradingCards";
import Header from "../HeaderPage";
import './Home.css';

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.seconds? timestamp.toDate() : timestamp;
  return new Date(date);
};

const Home = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [user] = useAuthState(auth);
  const totalTrades =0;
  const todaygain = 0;
  useEffect(() => {
    const fetchData = async () => {
      const activeTradesQuery = query(collection(db, "activeTrades"));
      const stockSnapshotQuery = query(collection(db, "stockSnapshot"));
      const stockHistoryQuery = query(
        collection(db, "userStockHistory"),
        where("userID", "==", user.uid)
        // where("start", ">=", new Date().toISOString())
      );
      const [activeTradesSnapshot, stockSnapshotSnapshot, stockHistorySnapshot] = await Promise.all([
        getDocs(activeTradesQuery),
        getDocs(stockSnapshotQuery),
        getDocs(stockHistoryQuery),
      ]);

      const activeTrades = activeTradesSnapshot.docs.map((doc) => ({
        id: doc.id,
        startDate: convertTimestampToDate(doc.data().start),
        detected_atDate: convertTimestampToDate(doc?.data()?.detected_at),
        ...doc.data(),
      }));
      const stockSnapshots = stockSnapshotSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const stockHistories = stockHistorySnapshot.docs.map((doc) => ({
        id: doc.id,
        startDate: convertTimestampToDate(doc.data().start),
        ...doc.data(),
      }));
      // console.log(stockHistories, activeTrades, stockSnapshots);
      // // console.log(stockHistories);
      const uniqueSymbols = [...new Set([
        ...stockHistories.map((history) => history.symbol)
      ])];
      // const todaystocks = stockHistories.filter((history) => {
      //   const today = new Date(stockHistories[0].end);
      //   today.setHours(0, 0, 0, 0);
      //   return new Date(history.end) >= today;
      // });
      // const todaysGain = (todaystocks.reduce((acc, trade) => acc + Number(trade.gain), 0)/todaystocks.length)*100 || 0;
      // setTodayGain(todaysGain);
      // setTotalTrades(todaystocks.length);
      // // console.log(todaystocks, todaysGain);

      const combined = uniqueSymbols.map((trade) => {
        const activeTrade = activeTrades
          .filter((activeTrade) => activeTrade.symbol === trade)
          .sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate));

        const stockSnapshot = stockSnapshots.find(
          (snapshot) => snapshot.symbol === trade
        );

        const stockHistory = stockHistories
          .filter((history) => history.symbol === trade)
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Get the most recent stockHistory or an empty object
        const stockDisplay = [];
        // if (activeTrade.length > 0) {
        //   stockDisplay.push(activeTrade[0]);
        // }
        if (stockHistory.length > 0) {
          stockDisplay.push(stockHistory[0]);
        }
        return {
          activeTrade,
          stockSnapshot,
          stockHistory,
          stockDisplay: stockDisplay.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
        };
        }).sort((a, b) => {
          if (!a.stockDisplay[0].startDate) return 1; // If a has no stockHistory, place it after b
          if (!b.stockDisplay[0].startDate) return -1; // If b has no stockHistory, place it after a
          return new Date(b.stockDisplay[0].startDate) - new Date(a.stockDisplay[0].startDate); // Order by the most recent stockHistory end date
      });
      console.log(combined, activeTrades);
      setCombinedData(combined);
    };

    fetchData();
  }, [user]);
  return (
    <IonPage>
      <Header />
      <IonContent>

        <IonCard className="balance-card">
          <IonCardContent className="Today-Stock-info">

            <div className="stock-gains-header">
              <div className="greeting">Hi {user?.displayName || ''},</div>
              <div className="this-week">
                <IonIcon icon={calendarOutline} className="chevron-down" />
                <IonIcon icon={chevronForwardOutline} className="chevron-down" />
              </div>
            </div>
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Total Amount</IonText>
              <IonText className="Today-Stock-details-value">${totalTrades || 100}</IonText>
            </div>
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Total Trades</IonText>
              <IonText className="Today-Stock-details-value">{totalTrades || 0}</IonText>
            </div>
            <div className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Gain</IonText>
              <IonText className="Today-Stock-details-value">{todaygain?.toFixed(2) || 0.00} %</IonText>
            </div>
          </IonCardContent>
        </IonCard>

        <div className="section-header">
          <h2>My Trades</h2>
          {/* <IonIcon icon={chevronForwardOutline} /> */}
        </div>
        <div style={{ overflow: 'auto' }}>
          {combinedData && combinedData.length > 0 ? (
            combinedData.map((doc, i) => (
              <div key={i}>
                {/* Access document data here */}
                <UserStockCard StockData={doc} />
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
