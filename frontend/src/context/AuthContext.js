import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  const [viewRole, setViewRole] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const introShown = await AsyncStorage.getItem("introShown");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setViewRole(parsedUser.role);
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
        setViewRole(result.user.role);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed";
      if (error.message?.includes("Network Error") || error.message?.includes("Network request failed")) {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else if (error.error) {
        errorMessage = error.error;
      }

      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, name, role) => {
    try {
      const result = await authService.register(email, password, name, role);

      if (result.success) {
        setUser(result.user);
        setViewRole(result.user.role);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Registration error:", error);

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
      setViewRole(null);
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

  const updateUserRole = (newRole) => {
    setViewRole(newRole);
  };

  const updateUserProfile = async (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      try {
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        return { success: true };
      } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to save profile" };
      }
    }
    return { success: false, error: "No user logged in" };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        viewRole,
        isLoading,
        showIntro,
        login,
        register,
        logout,
        completeIntro,
        updateUserRole,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
