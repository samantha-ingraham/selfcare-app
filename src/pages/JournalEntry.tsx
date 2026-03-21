import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

const JournalEntry: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Journal Entry</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p>Journal entry page coming soon</p>
      </IonContent>
    </IonPage>
  );
};

export default JournalEntry;
