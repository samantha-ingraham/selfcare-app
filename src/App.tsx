import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, calendar, book, settings } from "ionicons/icons";
import Home from "./pages/Home";
import CheckIn from "./pages/CheckIn";
import JournalHub from "./pages/JournalHub";
import JournalEntry from "./pages/JournalEntry";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

// import "@ionic/react/css/palettes/dark.always.css";
//import "@ionic/react/css/palettes/dark.class.css";
// import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

import { useEffect } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const q = query(
            collection(db, "themes"),
            where("userId", "==", currentUser.uid),
            where("isActive", "==", true),
            limit(1),
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const themeVars = snapshot.docs[0].data().themeVars;
            const root = document.documentElement;
            Object.entries(themeVars).forEach(([key, value]) => {
              root.style.setProperty(key, value as string);
            });
          }
        } catch (error) {
          console.error("Error loading theme:", error);
        }
      } else {
        document.documentElement.style.cssText = "";
      }
    });
    return unsubscribe;
  }, []);
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/Home">
              <Home />
            </Route>
            <Route exact path="/JournalHub">
              <JournalHub />
            </Route>
            <Route path="/CheckIn">
              <CheckIn />
            </Route>
            <Route exact path="/Settings">
              <Settings />
            </Route>
            <Route path="/JournalEntry">
              <JournalEntry />
            </Route>
            <Route path="/SignUp">
              <SignUp />
            </Route>
            <Redirect exact from="/" to="/Home" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="Home" href="/Home">
              <IonIcon aria-hidden="true" icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="Journal" href="/JournalHub">
              <IonIcon aria-hidden="true" icon={book} />
              <IonLabel>Journal</IonLabel>
            </IonTabButton>
            <IonTabButton tab="CheckIn" href="/CheckIn">
              <IonIcon aria-hidden="true" icon={calendar} />
              <IonLabel>Menty B Check In</IonLabel>
            </IonTabButton>
            <IonTabButton tab="Settings" href="/Settings">
              <IonIcon aria-hidden="true" icon={settings} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
