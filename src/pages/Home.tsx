import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButtons,
} from "@ionic/react";
import { IonIcon, useIonViewDidEnter } from "@ionic/react";
import { star, starOutline, heart, heartOutline } from "ionicons/icons";
import "./Home.css";
import { useLocation } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import LoginModal from "../components/LoginModal";

const DayCard: React.FC<{
  day: Date;
  label: string;
  isToday: boolean;
  checkins: number;
  entries: number;
}> = ({ day, label, isToday, checkins, entries }) => {
  return (
    <IonCard className={`day-card ${isToday ? "today-card" : ""}`}>
      <IonCardContent>
        <p>
          {day.getDate()} {label}
        </p>
        <div className="day-icon-row">
          <IonIcon icon={checkins > 0 ? star : starOutline} />
          <span>Check In</span>
        </div>
        <div className="day-icon-row">
          <IonIcon icon={entries > 0 ? heart : heartOutline} />
          <span>Journal</span>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [weekData, setWeekData] = useState<{
    [key: string]: { checkins: number; entries: number };
  }>({});
  const location = useLocation<{ showLogin?: boolean; message?: string }>();

  const loadWeekData = async (userId: string) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    try {
      const [checkinsSnap, entriesSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "checkins"),
            where("userId", "==", userId),
            where("createdAt", ">=", Timestamp.fromDate(startOfWeek)),
          ),
        ),
        getDocs(
          query(
            collection(db, "journalEntries"),
            where("userId", "==", userId),
            where("createdAt", ">=", Timestamp.fromDate(startOfWeek)),
          ),
        ),
      ]);

      const data: { [key: string]: { checkins: number; entries: number } } = {};

      checkinsSnap.docs.forEach((doc) => {
        const date = doc.data().createdAt.toDate().toDateString();
        if (!data[date]) data[date] = { checkins: 0, entries: 0 };
        data[date].checkins++;
      });

      entriesSnap.docs.forEach((doc) => {
        const date = doc.data().createdAt.toDate().toDateString();
        if (!data[date]) data[date] = { checkins: 0, entries: 0 };
        data[date].entries++;
      });

      setWeekData(data);
    } catch (error) {
      console.error("Error loading week data:", error);
    }
  };

  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLogin(true);
    }
  }, [location.state]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadWeekData(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  useIonViewDidEnter(() => {
    if (auth.currentUser) {
      loadWeekData(auth.currentUser.uid);
    }
  });

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  const getDaysOfWeek = () => {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = getDaysOfWeek();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end">
            {user ? (
              <IonButton onClick={handleSignOut}>Sign Out</IonButton>
            ) : (
              <IonButton onClick={() => setShowLogin(true)}>Login</IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {user ? (
          <>
            <h2>Welcome back, {user.displayName}!</h2>
            <p>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <IonGrid>
              <IonRow>
                {days.slice(0, 4).map((day, i) => (
                  <IonCol key={i}>
                    <DayCard
                      day={day}
                      label={dayLabels[i]}
                      isToday={day.toDateString() === new Date().toDateString()}
                      checkins={weekData[day.toDateString()]?.checkins || 0}
                      entries={weekData[day.toDateString()]?.entries || 0}
                    />
                  </IonCol>
                ))}
              </IonRow>
              <IonRow>
                {days.slice(4).map((day, i) => (
                  <IonCol key={i}>
                    <DayCard
                      day={day}
                      label={dayLabels[i + 4]}
                      isToday={day.toDateString() === new Date().toDateString()}
                      checkins={weekData[day.toDateString()]?.checkins || 0}
                      entries={weekData[day.toDateString()]?.entries || 0}
                    />
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </>
        ) : (
          <>
            <h2>Welcome!</h2>
          </>
        )}
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          message={location.state?.message}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
