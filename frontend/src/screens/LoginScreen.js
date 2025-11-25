import React, { useState, useContext } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  HelperText,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

export default function LoginScreen({ navigation }) {
  const { login, register } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");

    const demoEmail = "demo@mediconnect.com";
    const demoPassword = "demo123";

    try {
      const result = await login(demoEmail, demoPassword);

      if (!result.success) {
        const registerResult = await register(demoEmail, demoPassword, "Demo User");

        if (!registerResult.success) {
          setError(registerResult.error || "Cannot connect to server. Please check your connection.");
        }
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setError("Cannot connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons
            name="hospital-box"
            size={80}
            color={theme.colors.primary}
          />
          <Text
            variant="headlineLarge"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            MediConnect
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.text }]}
          >
            Your Healthcare Management System
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.cardTitle}>
              Welcome Back
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.cardSubtitle, { color: theme.colors.text, opacity: 0.7 }]}
            >
              Sign in to continue
            </Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError("");
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
              style={styles.input}
              error={error && !validateEmail(email) && email.length > 0}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              error={error && password.length > 0 && password.length < 6}
            />

            {error ? (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : "Sign In"}
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text variant="bodySmall" style={[styles.dividerText, { color: theme.colors.text }]}>
                OR
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={handleDemoLogin}
              style={styles.demoButton}
              contentStyle={styles.demoButtonContent}
              disabled={loading}
              icon="account-circle"
            >
              Try Demo Account
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("Signup")}
              style={styles.switchButton}
            >
              Don't have an account? Sign Up
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text
            variant="bodySmall"
            style={[styles.footerText, { color: theme.colors.text, opacity: 0.5 }]}
          >
            © 2025 MediConnect. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontWeight: "bold",
    marginTop: 16,
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    borderRadius: 24,
    elevation: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 238, 0.1)',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    marginTop: -8,
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    opacity: 0.6,
  },
  demoButton: {
    borderRadius: 8,
    borderColor: "#6200ee",
    borderWidth: 2,
  },
  demoButtonContent: {
    paddingVertical: 8,
  },
  switchButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
  },
});
