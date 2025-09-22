import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function LogoFAB({ onPress, backgroundColor }) {
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["#4db8a8", "#6ec9b9", "#8dd9ca"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fab}
      >
        <View style={styles.logoContainer}>
          <View style={styles.letterM}>
            <Text style={styles.mText}>M</Text>
            <View style={styles.medicalSymbol}>
              <MaterialCommunityIcons name="medical-bag" size={16} color="#fff" />
            </View>
          </View>
          
          <View style={styles.plusIcon}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    width: 68,
    height: 68,
    borderRadius: 34,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fab: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  logoContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  letterM: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  mText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  medicalSymbol: {
    position: "absolute",
    right: -8,
    top: -2,
    opacity: 0.9,
  },
  plusIcon: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: "#2d9687",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
