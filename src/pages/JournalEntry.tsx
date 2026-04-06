import React, { useState } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useHistory, useLocation } from "react-router-dom";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonTextarea,
  IonButton,
  IonLabel,
} from "@ionic/react";
import "./JournalEntry.css";

const JournalEntry: React.FC = () => {
  const location = useLocation<{
    prompt: string;
    existingEntry?: string;
    entryId?: string;
  }>();

  const prompt =
    location.state?.prompt ||
    "Free Write: Talk about anything, everything or nothing at all";

  const existingEntry = location.state?.existingEntry || "";

  const entryId = location.state?.entryId || null;

  const [entry, setEntry] = useState(existingEntry);

  const history = useHistory();

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert("Please log in to save your entry.");
      return;
    }
    try {
      if (entryId) {
        await updateDoc(doc(db, "journalEntries", entryId), {
          entry,
          lastModified: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "journalEntries"), {
          prompt,
          entry,
          createdAt: Timestamp.now(),
          lastModified: Timestamp.now(),
          userId: auth.currentUser?.uid,
        });
      }
      history.push("/JournalHub");
    } catch (error) {
      console.error("Error saving entry: ", error);
      alert("Something went wrong, please try again");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/JournalHub" />
          </IonButtons>
          <IonTitle>Journal Entry</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <p>{prompt}</p>
        <IonTextarea
          value={entry}
          onIonChange={(e) => setEntry(e.detail.value!)}
          rows={15}
          placeholder="..."
        />
        <IonButton expand="block" onClick={handleSave}>
          Save Entry
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default JournalEntry;
