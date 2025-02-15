import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonCard, IonCardContent, IonText, IonBadge, IonButton  } from '@ionic/react';
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";import moment from 'moment';
import { useLocation } from 'react-router-dom';
const convertTimestampToDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds? timestamp.toDate() : timestamp;
    return new Date(date);
  };
const TradeHistory = ({ symbol }) => {

    const location = useLocation();
    const passedData = location.state;
    const [stockHistory, setStockHistory] = useState([]);
    const [totalTrades, setTotalTrades] = useState(0);
    const [totalgain, setTotalGain] = useState(0);

    console.log(passedData);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const stockHistoryQuery = query(
                    collection(db, "stockHistory"),
                    where("symbol", "==", passedData.key)
                );
                const stockHistorySnapshot = await getDocs(stockHistoryQuery);
                const stockHistory = stockHistorySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    endDate: convertTimestampToDate(doc.data().end),
                    startDate: convertTimestampToDate(doc.data().start),
                    ...doc.data(),
                }));
                setStockHistory(stockHistory.sort((a, b) => new Date(b.endDate) - new Date(a.endDate)));
                const todaysGain = (stockHistory.reduce((acc, trade) => acc + Number(trade.gain), 0)/stockHistory.length)*100;
                setTotalTrades(stockHistory.length);
                setTotalGain(todaysGain);
                console.log(stockHistory);
            } catch (error) {
                console.error("Error fetching stock history: ", error.message);
                // Guide to create the required Firestore index
                console.error("The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/evalgotradingproj/firestore/indexes");
            }
        };
        fetchData();
    }, []);

    function calculateDateDifference(startDate, endDate) {
        const start = moment(startDate);
        const end = moment(endDate);
      
        if (!start.isValid() || !end.isValid()) {
          return 'Invalid date(s)';
        }
      
        const differenceInMinutes = end.diff(start, 'minutes');
        const hours = Math.floor(differenceInMinutes / 60);
        const minutes = differenceInMinutes % 60;
      
        const formattedDifference = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        return end.format('MMM DD HH:mm') + ` (${formattedDifference})`;
      }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>{passedData?.key} Trade History</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonCardContent className="Today-Stock-info">
                    <div color="dark" className="Today-Stock-details">
                        <IonText className="Today-Stock-details-header"># of Trades</IonText>
                        <IonText className="Today-Stock-details-value">{totalTrades}</IonText>
                    </div>
                    <div className="Today-Stock-details">
                        <IonText className="Today-Stock-details-header">Gain</IonText>
                        <IonText className="Today-Stock-details-value">{totalgain.toFixed(2)} %</IonText>
                    </div>
                </IonCardContent>
                {stockHistory.map((trade, i) => {
                    return (
                        <IonCard className="stock-card" key={i}>
                            <IonCardContent>
                                <div className="evaigo-overall">
                                    {/* <IonText color="dark" className="stock-title">
                                        <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{trade.symbol}</h4><IonBadge color={trade.tradeType === 'PAPER' ? 'tertiary' : (trade.tradeType === 'LIVE' ? 'success' : 'warning')} className='livebutton'>{trade.tradeType}</IonBadge>
                                    </IonText> */}
                                    <IonText color="dark" style={{ fontSize: '10px', fontWeight: '700', color: '#002d62' }}>
                                        {calculateDateDifference(trade.startDate, trade.endDate) || 0}  <IonBadge color={trade.tradeType === 'PAPER' ? 'tertiary' : (trade.tradeType === 'LIVE' ? 'success' : 'warning')} className='livebutton'>{trade?.tradeType?.charAt(0)}</IonBadge> 
                                        {/* {trade.method} */}
                                        {/* ({trade.strategy}) */}
                                    </IonText>
                                    <IonText color="dark" style={{ fontSize: '10px', fontWeight: '700', color: '#002d62' }}>
                                        {/* {trade.end|| 0}   */}
                                        {/* {trade.method} */}
                                        {/* ({trade.strategy}) */}
                                    </IonText>
                                    <IonText color="dark" style={{ fontSize: '14px', fontWeight: '700', color: '#002d62' }}>
                                        $ {trade.gain|| 0} ({trade.method === 'buy' ? 'B' : 'S'})
                                    </IonText>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    );
                })}
            </IonContent>
        </IonPage>
    );
};

export default TradeHistory;