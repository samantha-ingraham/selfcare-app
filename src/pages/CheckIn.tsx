import React, { useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonLabel,
  IonButton,
  IonItem,
  IonInput,
  IonRange,
  IonTextarea,
} from "@ionic/react";
import { moods } from "../moodData";
import "./CheckIn.css";

const CheckIn: React.FC = () => {
  const [mood, setMood] = useState("");
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [freeWrite, setFreeWrite] = useState("");

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert("Please log in to save your check in.");
      return;
    }
    try {
      await addDoc(collection(db, "checkins"), {
        mood,
        sleep,
        water,
        energy,
        stress,
        freeWrite,
        createdAt: Timestamp.now(),
        userId: auth.currentUser?.uid,
      });
      alert("check in saved!");
    } catch (error) {
      console.error("error saving checkin: ", error);
      alert(
        "beep boop. we encountered a problem saving your checkin. please try again.",
      );
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daily Check In</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonListHeader>
            <IonLabel>How are you feeling?</IonLabel>
          </IonListHeader>
          <div className="mood-scroll">
            {moods.map((m) => (
              <IonButton
                key={m.label}
                fill={mood === m.label ? "solid" : "outline"}
                onClick={() => setMood(m.label)}
                size="small"
              >
                <div className="mood-button-inner">
                  <span className="mood-emoji">{m.emoji}</span>
                  <span>{m.label}</span>
                </div>
              </IonButton>
            ))}
          </div>
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>How much sleep did you get last night?</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel position="stacked">Hours of Sleep</IonLabel>
            <IonInput
              type="number"
              value={sleep}
              onIonChange={(e) => setSleep(e.detail.value!)}
              placeholder="e.g. 7"
            />
          </IonItem>
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>How much water have you drank today?</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel position="stacked">Glasses of Water</IonLabel>
            <IonInput
              type="number"
              value={water}
              onIonChange={(e) => setWater(e.detail.value!)}
              placeholder="e.g 6"
            />
          </IonItem>
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>Energy</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonRange
              min={1}
              max={10}
              step={1}
              snaps={true}
              value={Number(energy)}
              onIonChange={(e) => setEnergy(String(e.detail.value))}
            >
              <IonLabel slot="start">Cannot lift arms</IonLabel>
              <IonLabel slot="end">Could Climb Mt. Everest</IonLabel>
            </IonRange>
          </IonItem>
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>Stress</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonRange
              min={1}
              max={10}
              step={1}
              snaps={true}
              value={Number(stress)}
              onIonChange={(e) => setStress(String(e.detail.value))}
            >
              <IonLabel slot="start">I'm so relaxed, I might melt</IonLabel>
              <IonLabel slot="end">I'm having heart palpatations</IonLabel>
            </IonRange>
          </IonItem>
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>
              Anything on your mind, that you want to leave behind?
            </IonLabel>
          </IonListHeader>
          <IonItem>
            <IonTextarea
              value={freeWrite}
              onIonChange={(e) => setFreeWrite(e.detail.value!)}
              rows={6}
              placeholder="Write freely here..."
            />
          </IonItem>
        </IonList>

        <IonButton expand="block" onClick={handleSubmit}>
          Submit Check In
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default CheckIn;
