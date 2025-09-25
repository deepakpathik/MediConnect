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

export default function SignupScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    setError("");

    if (!name || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Registration failed");
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
            Create your account
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.cardTitle}>
              Sign Up
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.cardSubtitle, { color: theme.colors.text, opacity: 0.7 }]}
            >
              Join MediConnect today
            </Text>

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              style={styles.input}
            />

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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError("");
              }}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
              error={error && confirmPassword && password !== confirmPassword}
            />

            {error ? (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSignup}
              style={styles.signupButton}
              contentStyle={styles.signupButtonContent}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : "Sign Up"}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("Login")}
              style={styles.switchButton}
            >
              Already have an account? Sign In
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
    borderRadius: 16,
    elevation: 4,
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
  signupButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  signupButtonContent: {
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
