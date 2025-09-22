import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const ThemeContext = createContext();

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6200ee",
    secondary: "#03dac6",
    background: "#f8f9fe",
    surface: "#ffffff",
    text: "#000000",
    gradient: ['#6200ee', '#9d4edd', '#bb86fc'],
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#bb86fc",
    secondary: "#03dac6",
    background: "#0a0a0a",
    surface: "#1a1a1a",
    text: "#ffffff",
    gradient: ['#1a1a2e', '#16213e', '#0f3460'],
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme) {
        setIsDark(storedTheme === "dark");
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
