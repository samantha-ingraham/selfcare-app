import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonListHeader,
  IonLabel,
  IonButton,
  useIonViewDidEnter,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { journalPrompts } from "../journalPrompts";
import "./JournalHub.css";

const getRandomPrompt = (prompts: string[]) => {
  return prompts[Math.floor(Math.random() * prompts.length)];
};

const JournalHub: React.FC = () => {
  const history = useHistory();
  const [pastEntries, setPastEntries] = useState<any[]>([]);

  const [displayedPrompts, setDisplayedPrompts] = useState([
    "Free Write: Talk about anything, everything or nothing at all",
    getRandomPrompt(journalPrompts.selfCare),
    getRandomPrompt(journalPrompts.creativeWriting),
    getRandomPrompt(journalPrompts.goalSetting),
    getRandomPrompt(journalPrompts.reflection),
  ]);

  const refreshPrompts = () => {
    setDisplayedPrompts([
      "Free Write: Talk about anything, everything or nothing at all",
      getRandomPrompt(journalPrompts.selfCare),
      getRandomPrompt(journalPrompts.creativeWriting),
      getRandomPrompt(journalPrompts.goalSetting),
      getRandomPrompt(journalPrompts.reflection),
    ]);
  };

  useIonViewDidEnter(() => {
    if (auth.currentUser) {
      const q = query(
        collection(db, "journalEntries"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("lastModified", "desc"),
      );
      getDocs(q).then((snapshot) => {
        setPastEntries(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      });
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(
          collection(db, "journalEntries"),
          where("userId", "==", user.uid),
          orderBy("lastModified", "desc"),
        );
        const snapshot = await getDocs(q);
        setPastEntries(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      } else {
        setPastEntries([]);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Journal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonListHeader>
          <IonLabel>Write about something...</IonLabel>
        </IonListHeader>
        {displayedPrompts.map((prompt, index) => (
          <IonCard
            key={index}
            button
            onClick={() => history.push("/JournalEntry", { prompt })}
          >
            <IonCardContent>{prompt}</IonCardContent>
          </IonCard>
        ))}
        <IonButton expand="block" onClick={refreshPrompts}>
          Get Different Prompts
        </IonButton>

        <IonListHeader>
          <IonLabel>Past Entries</IonLabel>
        </IonListHeader>
        {pastEntries.length === 0 ? (
          <IonCard>
            <IonCardContent>No entries yet</IonCardContent>
          </IonCard>
        ) : (
          pastEntries.map((entry) => (
            <IonCard
              key={entry.id}
              button
              onClick={() =>
                history.push("/JournalEntry", {
                  prompt: entry.prompt,
                  existingEntry: entry.entry,
                  entryId: entry.id,
                })
              }
            >
              <IonCardContent>
                <p>{entry.prompt}</p>
                <p>
                  First Draft: {entry.createdAt?.toDate().toLocaleDateString()}
                </p>
                <p>
                  Last update:{" "}
                  {entry.lastModified?.toDate().toLocaleDateString()}
                </p>
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default JournalHub;
