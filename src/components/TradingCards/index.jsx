import React, { useState, useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonText,
  IonChip,
  IonProgressBar,
  IonActionSheet,
  IonContent,useIonAlert,
} from "@ionic/react";
import { logoApple, arrowUp, arrowDown, statsChartOutline, logoGoogle, trendingDown, trendingUp } from "ionicons/icons";
import "./StockCard.css"; // We'll create this CSS file next
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebaseConfig"; // Adjust the import path as needed
import { db } from "../../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithGoogle } from '../login/signInWithGoogle'; // Adjust the import path as needed

import LoginPage from "../login"; 

const StockCard = ({ StockData }) => {
  
  const [user] = useAuthState(auth);
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionType, setActionType] = useState("");
  const currentPrice=StockData.stockSnapshot.snapshot[StockData.stockSnapshot.symbol].minuteBar.c;
  const OpenPrice=StockData.stockSnapshot.snapshot[StockData.stockSnapshot.symbol].minuteBar.o;
  const DailyBarValue=(((currentPrice - OpenPrice)/currentPrice) * 100).toFixed(2);
  const isPositive = DailyBarValue >= 0;
  const NoOfTrades=StockData.stockHistory.length;
  const TodayGain = (StockData.stockHistory.reduce((acc, trade) => acc + Number(trade.gain), 0) / NoOfTrades).toFixed(2);
  
  const PreCurrentPrice=StockData.stockSnapshot.snapshot[StockData.stockSnapshot.symbol].prevDailyBar.c;
  const PrevOpenPrice=StockData.stockSnapshot.snapshot[StockData.stockSnapshot.symbol].prevDailyBar.o;
  const PrevDailyBarValue=(((PreCurrentPrice - PrevOpenPrice)/PreCurrentPrice) * 100).toFixed(2);
  const PrevisPositive = PrevDailyBarValue >= 0;
  const handleAction = (type) => {
    if (user) {
      // User is logged in, proceed with the action
      const fetchUserData = async () => {
        const docRef = doc(db, "CustomUser", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          presentAlert({
            header: "Action Confirmation",
            message:
              "You are already logged in. we are verifying your documents before wait for update.",
            buttons: [
              "Cancel",
              // { text: 'Verify', handler: () => history.push('/profile') },
            ],
          });
          return;
        } else {
          presentAlert({
            header: "Action Confirmation",
            message:
              "You are already logged in. Please verify your documents before proceeding.",
            buttons: [
              "Cancel",
              { text: "Verify", handler: () => history.push("/verify-profile") },
            ],
          });
        }
      };

      fetchUserData();
      // });
      console.log(
        `Performing ${type} action for ${StockData.activeTrade.symbol}`
      );
      // Add your buy/sell logic here
    } else {
      // User is not logged in, show action sheet
      setActionType(type);
      setShowActionSheet(true);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("Signing in with Google");
    await signInWithGoogle().then(() => {
      console.log("User signed in with Google");
      history.push('/verify-profile');
      setShowActionSheet(false);
    });
  };

  return (
    <IonCard className="stock-card">
      <IonCardContent>
        <div className="evaigo-overall">
          <IonText color="dark">
              <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{StockData.activeTrade.symbol}</h4>
              </IonText>
          <IonIcon icon={statsChartOutline} color="success" />
        </div>
        <div className="stock-details">
          <IonText color="dark" style={{ fontSize: '14px', fontWeight: '700', color: '#002d62' }}>
            $ {StockData.stockSnapshot.snapshot[StockData.stockSnapshot.symbol].minuteBar.c}
          </IonText>
          <IonChip color={isPositive ? "primary" : "danger"} className="stock-details" style={{ fontSize: '12px' }}>
            <IonIcon icon={isPositive ? trendingUp : trendingDown} />
            {DailyBarValue} %
          </IonChip>
        </div>
        <div className="stock-info">
          <IonProgressBar style={{ 'marginRight': '10px' }} value={StockData.activeTrade.strength / 100} color="primary" ></IonProgressBar>
          <div color="dark" className="stock-details">
            <IonText className="stock-details-header"># of Trades:</IonText>
            <IonText className="stock-details-value">{NoOfTrades}</IonText>
          </div>
          <div className="stock-details">
            <IonText className="stock-details-header">Gain:</IonText>
            <IonText className="stock-details-value">{TodayGain === 'NaN'?0:TodayGain } %</IonText>
          </div>
          {console.log(StockData.stockHistory)}
          <IonText className="stock-details-note">Last <span className="stock-details-note-highlight">{StockData.activeTrade.method}</span> Trade Signal at <span className="stock-details-note-highlight">{StockData.stockHistory[0]?.end}</span> </IonText> 
        </div>
        <div className="card-footer">
          <div color="medium" className="last-day">
            <IonText style={{ fontSize: '8px' }}>Last Day</IonText>
            <IonText color={PrevisPositive ? "primary" : "danger"} className="last-day-value">
              <IonIcon icon={PrevisPositive ? trendingUp : trendingDown} />
              {` ${PrevDailyBarValue} %`}
            </IonText>
          </div>
          <div className="stock-actions">
            <IonButton className='Secondary-Default_button' onClick={() => handleAction("Buy")} size="small" disabled={StockData.activeTrade.method === 'sell'}>
              Buy
            </IonButton>
            <IonButton className='Secondary-Default_button' onClick={() => handleAction("Sell")} size="small" disabled={StockData.activeTrade.method === 'buy'}>
              Sell
            </IonButton>
          </div>
        </div>
        
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${StockData.activeTrade.symbol}`}
          buttons={[
            {
              text: 'Sign in with Google',
              icon: logoGoogle,
              handler: handleGoogleSignIn
            },
            {
              text: 'Cancel',
              role: 'cancel',
            }
          ]}
        >
          <IonContent>
            <LoginPage />
          </IonContent>
        </IonActionSheet>
      </IonCardContent>
    </IonCard>
  );
};

export default StockCard;
