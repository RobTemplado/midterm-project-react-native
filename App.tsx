import React from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { JobProvider } from "./src/context/JobContext";
import AppNavigator from "./src/navigation/AppNavigator.tsx";
import { useFonts, Anton_400Regular } from "@expo-google-fonts/anton";

export default function App() {
  const [fontsLoaded] = useFonts({ Anton_400Regular });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JobProvider>
        <StatusBar hidden />
        <AppNavigator />
      </JobProvider>
    </GestureHandlerRootView>
  );
}
