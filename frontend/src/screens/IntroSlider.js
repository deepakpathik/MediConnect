import React, { useContext } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { Button } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Welcome to MediConnect",
    text: "Your complete healthcare management system at your fingertips",
    icon: "hospital-box",
    backgroundColor: "#6200ee",
  },
  {
    key: "2",
    title: "Manage Your Doctors",
    text: "Add, organize, and keep track of all your healthcare providers in one place",
    icon: "doctor",
    backgroundColor: "#03dac6",
  },
  {
    key: "3",
    title: "Stay Organized",
    text: "Book appointments, store medical records, and set reminders for medications",
    icon: "calendar-check",
    backgroundColor: "#bb86fc",
  },
];

export default function IntroSlider({ onDone }) {
  const { theme } = useContext(ThemeContext);

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={item.icon} size={120} color="#fff" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <MaterialCommunityIcons name="check" size={24} color="#fff" />
      </View>
    );
  };

  const renderSkipButton = () => {
    return (
      <View style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </View>
    );
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={onDone}
      onSkip={onDone}
      showSkipButton={true}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      renderSkipButton={renderSkipButton}
      dotStyle={styles.dotStyle}
      activeDotStyle={styles.activeDotStyle}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  buttonCircle: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dotStyle: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDotStyle: {
    backgroundColor: "#fff",
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
