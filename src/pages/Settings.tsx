import React, { useState, useEffect } from "react";
import Color from "color";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  where,
  query,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  IonContent,
  IonHeader,
  IonListHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonLabel,
  IonItem,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  useIonViewDidEnter,
} from "@ionic/react";
import "./Settings.css";

const buildColorVars = (name: string, hex: string) => {
  const c = Color(hex);
  const rgb = c.rgb().array();
  const isLight = c.isLight();
  return {
    [`--ion-color-${name}`]: hex,
    [`--ion-color-${name}-rgb`]: rgb.map(Math.round).join(","),
    [`--ion-color-${name}-contrast`]: isLight ? "#000000" : "#ffffff",
    [`--ion-color-${name}-contrast-rgb`]: isLight ? "0,0,0" : "255,255,255",
    [`--ion-color-${name}-shade`]: c.darken(0.1).hex(),
    [`--ion-color-${name}-tint`]: c.lighten(0.1).hex(),
  };
};

const ColorSchemeCard: React.FC<{
  mode: string;
  colors: string[];
  onPreview: () => void;
}> = ({ mode, colors, onPreview }) => {
  return (
    <IonCard className="scheme-card">
      <IonCardHeader>
        <IonCardTitle>{mode}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="swatch-row">
          {colors.map((color, i) => (
            <div
              key={i}
              className="swatch"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <IonButton expand="block" onClick={onPreview}>
          Preview
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

const Settings: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  const [previewedScheme, setPreviewedScheme] = useState<{
    colors: string[];
    mode: string;
  } | null>(null);
  const [savedThemes, setSavedThemes] = useState<any[]>([]);
  const [colorSchemes, setColorSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");

  const generateSchemes = async () => {
    setLoading(true);
    const hex = selectedColor.replace("#", "");
    const modes = [
      "monochrome",
      "monochrome-light",
      "monochrome-dark",
      "analogic",
      "complement",
    ];

    try {
      const results = await Promise.all(
        modes.map((mode) =>
          fetch(
            `https://www.thecolorapi.com/scheme?hex=${hex}&mode=${mode}&count=5&format=json`,
          ).then((r) => r.json()),
        ),
      );
      const schemes = results.map((result) => ({
        mode: result.mode,
        colors: result.colors.map((c: any) => c.hex.value),
      }));
      setColorSchemes(schemes);
    } catch (error) {
      console.error("Color Api Error: ", error);
      alert("something went wrong getting color schemes");
    } finally {
      setLoading(false);
    }
  };

  const previewScheme = (colors: string[], mode: string) => {
    const root = document.documentElement;

    if (mode === "monochrome") {
      root.style.setProperty("--ion-background-color", colors[4]);
      root.style.setProperty("--ion-text-color", colors[0]);
      root.style.setProperty("--ion-color-primary", colors[2]);
      root.style.setProperty("--ion-color-secondary", colors[1]);
      root.style.setProperty("--ion-color-light", colors[3]);
    } else if (mode === "monochrome-light") {
      root.style.setProperty("--ion-background-color", colors[4]);
      root.style.setProperty("--ion-text-color", colors[0]);
      root.style.setProperty("--ion-color-primary", colors[3]);
      root.style.setProperty("--ion-color-secondary", colors[2]);
      root.style.setProperty("--ion-color-light", colors[4]);
    } else if (mode === "monochrome-dark") {
      root.style.setProperty("--ion-background-color", colors[0]);
      root.style.setProperty("--ion-text-color", colors[3]);
      root.style.setProperty("--ion-color-primary", colors[1]);
      root.style.setProperty("--ion-color-secondary", colors[4]);
      root.style.setProperty("--ion-color-light", colors[2]);
    } else if (mode === "analogic") {
      root.style.setProperty("--ion-background-color", colors[1]);
      root.style.setProperty("--ion-text-color", colors[4]);
      root.style.setProperty("--ion-color-primary", colors[2]);
      root.style.setProperty("--ion-color-secondary", colors[1]);
      root.style.setProperty("--ion-color-light", colors[3]);
    } else if (mode === "complement") {
      root.style.setProperty("--ion-background-color", colors[1]);
      root.style.setProperty("--ion-text-color", colors[4]);
      root.style.setProperty("--ion-color-primary", colors[3]);
      root.style.setProperty("--ion-color-secondary", colors[2]);
      root.style.setProperty("--ion-color-light", colors[0]);
    }
    setPreviewedScheme({ colors, mode });
  };

  const saveTheme = async () => {
    if (!auth.currentUser) {
      alert("Please log in to save a theme.");
      return;
    }
    if (!previewedScheme) {
      alert("Please preview a scheme first.");
      return;
    }
    if (savedThemes.length >= 5) {
      alert("You can only save up to 5 themes. Please delete one first.");
      return;
    }

    const { colors, mode } = previewedScheme;

    const getMappedColors = () => {
      if (mode === "monochrome")
        return {
          background: colors[4],
          text: colors[0],
          primary: colors[2],
          secondary: colors[1],
          light: colors[3],
        };
      if (mode === "monochrome-light")
        return {
          background: colors[4],
          text: colors[0],
          primary: colors[3],
          secondary: colors[2],
          light: colors[4],
        };
      if (mode === "monochrome-dark")
        return {
          background: colors[0],
          text: colors[3],
          primary: colors[1],
          secondary: colors[4],
          light: colors[2],
        };
      if (mode === "analogic")
        return {
          background: colors[1],
          text: colors[4],
          primary: colors[2],
          secondary: colors[1],
          light: colors[3],
        };
      if (mode === "complement")
        return {
          background: colors[1],
          text: colors[4],
          primary: colors[3],
          secondary: colors[2],
          light: colors[0],
        };
      return {
        background: colors[4],
        text: colors[0],
        primary: colors[2],
        secondary: colors[1],
        light: colors[3],
      };
    };

    const mapped = getMappedColors();

    const themeVars = {
      ...buildColorVars("primary", mapped.primary),
      ...buildColorVars("secondary", mapped.secondary),
      ...buildColorVars("light", mapped.light),
      "--ion-background-color": mapped.background,
      "--ion-text-color": mapped.text,
    };

    try {
      await addDoc(collection(db, "themes"), {
        userId: auth.currentUser.uid,
        mode,
        colors,
        themeVars,
        nickname,
        createdAt: Timestamp.now(),
      });
      alert("Theme saved!");
    } catch (error) {
      console.error("Error saving theme:", error);
      alert("Something went wrong saving your theme.");
    }
  };

  const resetTheme = async () => {
    document.documentElement.style.cssText = "";
    if (!auth.currentUser) return;
    try {
      const batch = savedThemes.map((theme) =>
        updateDoc(doc(db, "themes", theme.id), { isActive: false }),
      );
      await Promise.all(batch);
    } catch (error) {
      console.error("Error resetting theme:", error);
    }
  };

  const loadSavedThemes = async () => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "themes"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const snapshot = await getDocs(q);
    setSavedThemes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const deleteTheme = async (id: string) => {
    await deleteDoc(doc(db, "themes", id));
    loadSavedThemes();
  };

  const applyTheme = async (themeVars: any, themeId: string) => {
    // Apply visually
    const root = document.documentElement;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

    // Set active in Firestore
    try {
      // Clear isActive from all themes
      const batch = savedThemes.map((theme) =>
        updateDoc(doc(db, "themes", theme.id), { isActive: false }),
      );
      await Promise.all(batch);
      // Set this one as active
      await updateDoc(doc(db, "themes", themeId), { isActive: true });
    } catch (error) {
      console.error("Error setting active theme:", error);
    }
  };

  useIonViewDidEnter(() => {
    loadSavedThemes();
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        loadSavedThemes();
      }
    });
    return unsubscribe;
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonListHeader>
            <IonLabel>Theme Color</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel>Pick a color</IonLabel>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </IonItem>
          <IonButton
            expand="block"
            onClick={generateSchemes}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Color Schemes"}
          </IonButton>
          <IonItem>
            <IonInput
              value={nickname}
              onIonChange={(e) => setNickname(e.detail.value!)}
              placeholder="Give this theme a nickname..."
            />
          </IonItem>

          <IonButton
            expand="block"
            onClick={saveTheme}
            disabled={!previewedScheme}
          >
            Save Current Theme
          </IonButton>
          <IonButton expand="block" onClick={resetTheme}>
            Reset to Default
          </IonButton>
        </IonList>
        <IonGrid>
          <IonRow>
            {colorSchemes.map((scheme, index) => (
              <IonCol size="6" sizeMd="4" sizeLg="3" key={index}>
                <ColorSchemeCard
                  mode={scheme.mode}
                  colors={scheme.colors}
                  onPreview={() => previewScheme(scheme.colors, scheme.mode)}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonList>
          <IonListHeader>
            <IonLabel>Saved Themes</IonLabel>
          </IonListHeader>
          {savedThemes.length === 0 ? (
            <IonItem>
              <IonLabel>No saved themes yet</IonLabel>
            </IonItem>
          ) : (
            savedThemes.map((theme) => (
              <IonItem key={theme.id}>
                <IonLabel>{theme.nickname || theme.mode}</IonLabel>
                <IonButton
                  slot="end"
                  onClick={() => applyTheme(theme.themeVars, theme.id)}
                >
                  Apply
                </IonButton>
                <IonButton
                  slot="end"
                  fill="outline"
                  color="danger"
                  onClick={() => deleteTheme(theme.id)}
                >
                  Delete
                </IonButton>
              </IonItem>
            ))
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
