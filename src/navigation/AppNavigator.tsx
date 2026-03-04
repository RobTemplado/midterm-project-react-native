import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useJobs } from "../context/JobContext";

import JobFinderScreen from "../screens/JobFinderScreen.tsx";
import SavedJobsScreen from "../screens/SavedJobsScreen";
import ApplyFormScreen from "../screens/ApplyFormScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { isDarkMode } = useJobs();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" },
        headerTintColor: isDarkMode ? "#fff" : "#000",
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
          height: 58,
          paddingTop: 4,
          paddingBottom: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={JobFinderScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved Jobs"
        component={SavedJobsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Apply"
          component={ApplyFormScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Job Details"
          component={JobDetailsScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
