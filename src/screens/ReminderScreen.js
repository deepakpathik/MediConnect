import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { ThemeContext } from "../context/ThemeContext";

export default function ReminderScreen() {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Reminders" titleStyle={{ color: "#fff" }} />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Text variant="titleLarge" style={{ color: theme.colors.text }}>
          Reminders Coming Soon
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.text, marginTop: 8 }}>
          This feature will be available in the next update
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
