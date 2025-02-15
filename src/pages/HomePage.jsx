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
import { collection, query, getDocs, orderBy, where, Timestamp  } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebaseConfig";import moment from 'moment';
import { pin, share, trash } from "ionicons/icons";
import "./Home.css";
import Header from "../components/HeaderPage";
import StockCard from "../components/TradingCards";
import NewHome from "../components/Home";
const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.seconds? timestamp.toDate() : timestamp;
  return new Date(date);
};
const Home = (props) => {
  // const [customUser] = props;
  const [combinedData, setCombinedData] = useState([]);
  const [totalTrades, setTotalTrades] = useState(0);
  const [todaygain, setTodayGain] = useState(0);
  // const [value, loading, error] = useCollection(collection(db, "activeTrades")); // Now it's safe to access value.docs 
  useEffect(() => {
    const fetchData = async () => {
      const activeTradesQuery = query(collection(db, "activeTrades"));
      const stockSnapshotQuery = query(collection(db, "stockSnapshot"));
      // const stockHistoryQuery = query(collection(db, "stockHistory"), orderBy("end", "desc"));
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 1);
    const threeDaysAgoTimestamp = Timestamp.fromDate(fiveDaysAgo);

      const stockHistoryQuery = query(
        collection(db, "stockHistory"),
        // orderBy("end", "desc")
        where("start", ">=", threeDaysAgoTimestamp)
      );
      const [activeTradesSnapshot, stockSnapshotSnapshot, stockHistorySnapshot] = await Promise.all([
        getDocs(activeTradesQuery),
        getDocs(stockSnapshotQuery),
        getDocs(stockHistoryQuery),
      ]);

      const activeTrades = activeTradesSnapshot.docs.map((doc) => ({
        id: doc.id,
        detected_atDate: convertTimestampToDate(doc.data().start),
        ...doc.data(),
      }));
      const stockSnapshots = stockSnapshotSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const stockHistories = stockHistorySnapshot.docs.map((doc) => ({
        id: doc.id,
        startDate: convertTimestampToDate(doc.data().start),
        endDate: convertTimestampToDate(doc.data().end),
        detected_atDate: convertTimestampToDate(doc.data().end),
        ...doc.data(),
      }));
      console.log(stockHistories,'---------->StockHostory');
      const uniqueSymbols = [...new Set([
        ...activeTrades.map((trade) => trade.symbol),
        ...stockHistories.map((history) => history.symbol)
      ])];
      const todaystocks = stockHistories.filter((history) => {
        const today = new Date(stockHistories[0].end);
        today.setHours(0, 0, 0, 0);
        return new Date(history.end) >= today;
      });
      const todaysGain = (todaystocks.reduce((acc, trade) => acc + Number(trade.gain), 0)/todaystocks.length)*100 || 0;
      setTodayGain(todaysGain);
      setTotalTrades(todaystocks.length);
      // console.log(todaystocks, todaysGain);

      const combined = uniqueSymbols.map((trade) => {
        const activeTrade = activeTrades
          .filter((activeTrade) => activeTrade.symbol === trade)
          .sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate));

        const stockSnapshot = stockSnapshots.find(
          (snapshot) => snapshot.symbol === trade
        );

        const stockHistory = stockHistories
          .filter((history) => history.symbol === trade)
          .sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate)); // Get the most recent stockHistory or an empty object
        const stockDisplay = [];
        if (activeTrade.length > 0) {
          stockDisplay.push(activeTrade[0]);
        }
        if (stockHistory.length > 0) {
          stockDisplay.push(stockHistory[0]);
        }
        return {
          activeTrade,
          stockSnapshot,
          stockHistory,
          stockDisplay: stockDisplay.sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate)),
        };
      }).sort((a, b) => {
        if (!a.stockDisplay[0].detected_atDate) return 1; // If a has no stockHistory, place it after b
        if (!b.stockDisplay[0].detected_atDate) return -1; // If b has no stockHistory, place it after a
        return new Date(b.stockDisplay[0].detected_atDate) - new Date(a.stockDisplay[0].detected_atDate); // Order by the most recent stockHistory end date
      });
      console.log(combined, activeTrades);
      setCombinedData(combined);
    };

    fetchData();
  }, []);
  // if (error) {
  //   return <strong>Error: {JSON.stringify(error)}</strong>;
  // }

  // if (loading) {
  //   return <IonSpinner />;
  // }

  return (
    <IonPage>
      <Header {...props} />
      <IonContent>
        <IonCard className="balance-card">
          <IonCardContent className="Today-Stock-info">
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Total Trades</IonText>
              <IonText className="Today-Stock-details-value">{totalTrades}</IonText>
            </div>
            <div className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Gain</IonText>
              <IonText className="Today-Stock-details-value">{todaygain.toFixed(2)} %</IonText>
            </div>
          </IonCardContent>
        </IonCard>
        <div>
          {combinedData && combinedData.length > 0 ? (
            combinedData.map((doc, i) => (
              <div key={i}>
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
