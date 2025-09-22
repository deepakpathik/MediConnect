import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const introShown = await AsyncStorage.getItem("introShown");

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }

      if (!introShown) {
        setShowIntro(true);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      
      // Provide more detailed error messages
      let errorMessage = "Login failed";
      if (error.message?.includes("Network Error") || error.message?.includes("Network request failed")) {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, name) => {
    try {
      const result = await authService.register(email, password, name);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Registration error:", error);
      
      // Provide more detailed error messages
      let errorMessage = "Registration failed";
      if (error.message?.includes("Network Error") || error.message?.includes("Network request failed")) {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const completeIntro = async () => {
    try {
      await AsyncStorage.setItem("introShown", "true");
      setShowIntro(false);
    } catch (error) {
      console.error("Error completing intro:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        showIntro,
        login,
        register,
        logout,
        completeIntro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
