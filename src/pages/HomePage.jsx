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
// Import preference functions
import { getAndStoreActiveTrades, getAndStoreStockSnapshots, isCacheStale } from "../utils/preferences";
import { db } from "../firebaseConfig";
import moment from 'moment';
import { pin, share, trash } from "ionicons/icons";
import "./Home.css";
import Header from "../components/HeaderPage";
import StockCard from "../components/TradingCards";
import NewHome from "../components/Home";
import Loader from "./Loader";

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.seconds? timestamp.toDate() : timestamp;
  return new Date(date);
};

const Home = (props) => {
  const [combinedData, setCombinedData] = useState([]);
  const [totalTrades, setTotalTrades] = useState(0);
  const [todaygain, setTodayGain] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if cache is stale
        // const isActiveTradesStale = await isCacheStale('activeTrades', 5); // 5 minutes
        // const isStockSnapshotsStale = await isCacheStale('stockSnapshots', 5);
        
        
        // Fetch data (will use cache if available and not stale)
        const [activeTrades, stockSnapshots] = await Promise.all([
          getAndStoreActiveTrades(),
          getAndStoreStockSnapshots()
        ]);
        
        // Process the data
        if (!activeTrades || !stockSnapshots) {
          console.error('Failed to fetch required data');
          setLoading(false);
          return;
        }
        
        const processedActiveTrades = activeTrades.map(trade => ({
          ...trade,
          detected_atDate: trade.start instanceof Date ? trade.start : convertTimestampToDate(trade.start)
        }));
        
        // Rest of processing logic
        const uniqueSymbols = [...new Set(processedActiveTrades.map((trade) => trade.symbol))];
        setTotalTrades(processedActiveTrades.length);
        
        const combined = uniqueSymbols.map((symbol) => {
          const activeTrade = processedActiveTrades
            .filter((trade) => trade.symbol === symbol)
            .sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate));
            
          const stockSnapshot = stockSnapshots.snapshot[symbol];
          
          const stockDisplay = [];
          if (activeTrade.length > 0) {
            stockDisplay.push(activeTrade[0]);
          }
          
          return {
            activeTrade,
            stockSnapshot,
            stockDisplay: stockDisplay.sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate)),
          };
        }).sort((a, b) => {
          if (!a.stockDisplay[0]?.detected_atDate) return 1;
          if (!b.stockDisplay[0]?.detected_atDate) return -1;
          return new Date(b.stockDisplay[0].detected_atDate) - new Date(a.stockDisplay[0].detected_atDate);
        });
        
        console.log('Combined data:', combined);
        setCombinedData(combined);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <IonPage >
      <Header {...props} />
      <IonContent fullscreen>
        <IonCard className="balance-card">
          <IonCardContent className="Today-Stock-info">
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Live Trades</IonText>
              <IonText className="Today-Stock-details-value">{totalTrades}</IonText>
            </div>
          </IonCardContent>
        </IonCard>
        <div>
          {loading ? (
            <Loader />
          ) : combinedData && combinedData.length > 0 ? (
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
