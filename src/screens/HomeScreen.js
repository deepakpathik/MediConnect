import React, { useContext, useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import {
  Appbar,
  Card,
  Text,
  IconButton,
  Menu,
  Divider,
  Snackbar,
  Portal,
} from "react-native-paper";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { doctorService } from "../services/doctorService";
import AddDoctorModal from "../components/AddDoctorModal";
import LogoFAB from "../components/LogoFAB";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  const { logout, user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [menuKey, setMenuKey] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const result = await doctorService.getAllDoctors();
      if (result.success) {
        setDoctors(result.doctors);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      showSnackbar("Error loading doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (doctor) => {
    try {
      const result = await doctorService.createDoctor(doctor);
      if (result.success) {
        setDoctors([result.doctor, ...doctors]);
        setModalVisible(false);
        showSnackbar("Doctor added successfully");
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      showSnackbar(error.error || "Error adding doctor");
    }
  };

  const handleDeleteDoctor = (id, name) => {
    Alert.alert(
      "Delete Doctor",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await doctorService.deleteDoctor(id);
              setDoctors(doctors.filter((doc) => doc.id !== id));
              showSnackbar("Doctor deleted");
            } catch (error) {
              console.error("Error deleting doctor:", error);
              showSnackbar("Error deleting doctor");
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Database",
      "Are you sure you want to delete all doctors? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await doctorService.deleteAllDoctors();
              setDoctors([]);
              setMenuVisible(false);
              showSnackbar("Database reset successfully");
            } catch (error) {
              console.error("Error resetting database:", error);
              showSnackbar("Error resetting database");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setMenuVisible(false);
            await logout();
          },
        },
      ]
    );
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const renderDoctorCard = ({ item }) => (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, elevation: 3 },
      ]}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text variant="titleLarge" style={{ color: theme.colors.text }}>
              {item.name}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.primary, marginTop: 4 }}
            >
              {item.specialty}
            </Text>
          </View>
          <IconButton
            icon="delete"
            iconColor={theme.colors.error}
            size={24}
            onPress={() => handleDeleteDoctor(item.id, item.name)}
          />
        </View>

        {item.phone && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="phone"
              size={16}
              color={theme.colors.text}
            />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {item.phone}
            </Text>
          </View>
        )}

        {item.email && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="email"
              size={16}
              color={theme.colors.text}
            />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {item.email}
            </Text>
          </View>
        )}

        {item.address && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.colors.text}
            />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {item.address}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content 
          title="Doctors" 
          subtitle={user ? `Welcome, ${user.name}` : ""}
          titleStyle={{ color: "#fff" }}
          subtitleStyle={{ color: "#fff", opacity: 0.8 }}
        />
        <Appbar.Action
          icon="dots-vertical"
          color="#fff"
          onPress={() => {
            setMenuVisible(true);
            setMenuKey((prev) => prev + 1);
          }}
        />
      </Appbar.Header>

      <Portal>
        <Menu
          key={menuKey}
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
            setTimeout(() => setMenuKey((prev) => prev + 1), 100);
          }}
          anchorPosition="top"
          contentStyle={{ marginTop: 50 }}
          anchor={{ x: 1000, y: 0 }}
        >
          <Menu.Item
            onPress={async () => {
              setMenuVisible(false);
              await toggleTheme();
              setTimeout(() => setMenuKey((prev) => prev + 1), 100);
            }}
            leadingIcon={isDark ? "white-balance-sunny" : "moon-waning-crescent"}
            title={isDark ? "Light Mode" : "Dark Mode"}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleReset();
              setTimeout(() => setMenuKey((prev) => prev + 1), 100);
            }}
            leadingIcon="delete-sweep"
            title="Reset Database"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleLogout();
              setTimeout(() => setMenuKey((prev) => prev + 1), 100);
            }}
            leadingIcon="logout"
            title="Logout"
          />
        </Menu>
      </Portal>

      {doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="doctor"
            size={80}
            color={theme.colors.primary}
          />
          <Text
            variant="titleLarge"
            style={[styles.emptyText, { color: theme.colors.text }]}
          >
            No doctors added yet
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.text, opacity: 0.6 }}
          >
            Tap the + button to add your first doctor
          </Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDoctorCard}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadDoctors}
        />
      )}

      <LogoFAB
        onPress={() => setModalVisible(true)}
        backgroundColor={theme.colors.primary}
      />

      <AddDoctorModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onAdd={handleAddDoctor}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 238, 0.1)',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
});
