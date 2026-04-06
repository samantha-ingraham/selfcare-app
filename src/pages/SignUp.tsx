import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { useHistory } from "react-router";
import { doc, setDoc } from "firebase/firestore";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const history = useHistory();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: username });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName,
        lastName,
        username,
        email,
      });
      await signOut(auth);
      history.push("/Home", {
        showLogin: true,
        message: "Account created! Please log in.",
      });
    } catch (error) {
      console.error("Signup error: ", error);
      alert("Something wrong!! Try again");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/Home" />
          </IonButtons>
          <IonTitle>Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonItem>
          <IonLabel position="stacked">Username</IonLabel>
          <IonInput
            type="text"
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
            placeholder="your username"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">First Name</IonLabel>
          <IonInput
            type="text"
            value={firstName}
            onIonChange={(e) => setFirstName(e.detail.value!)}
            placeholder="Jane"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Last Name</IonLabel>
          <IonInput
            type="text"
            value={lastName}
            onIonChange={(e) => setLastName(e.detail.value!)}
            placeholder="Doe"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            placeholder="your@email.com"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            placeholder="••••••••"
          />
        </IonItem>
        <IonButton expand="block" onClick={handleSignUp}>
          Create Account
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SignUp;
