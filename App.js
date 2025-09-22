import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider, ActivityIndicator } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import IntroSlider from "./src/screens/IntroSlider";

function AppContent() {
  const { theme } = React.useContext(ThemeContext);
  const { isAuthenticated, isLoading, showIntro, completeIntro } = React.useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (showIntro) {
    return <IntroSlider onDone={completeIntro} />;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {isAuthenticated ? (
          <AppNavigator />
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
