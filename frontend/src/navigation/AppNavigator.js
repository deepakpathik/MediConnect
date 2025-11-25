import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import HomeScreen from "../screens/HomeScreen";
import AppointmentScreen from "../screens/AppointmentScreen";
import RecordsScreen from "../screens/RecordsScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ReminderScreen from "../screens/ReminderScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { user } = useContext(AuthContext);
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />

      {isDoctor ? (
        <>
          <Tab.Screen
            name="Appointments"
            component={AppointmentScreen}
            options={{
              tabBarLabel: "Appointments",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-clock" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Diseases"
            component={RecordsScreen}
            options={{
              tabBarLabel: "Diseases",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="virus" color={color} size={size} />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Appointments"
            component={AppointmentScreen}
            options={{
              tabBarLabel: "Appointments",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-account" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="MyRecords"
            component={RecordsScreen}
            options={{
              tabBarLabel: "My Records",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="file-document" color={color} size={size} />
              ),
            }}
          />
        </>
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Reminders" component={ReminderScreen} />
    </Stack.Navigator>
  );
}
