import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Modal, TouchableOpacity, AppState } from "react-native";
import { Text, Card, Button, Surface, IconButton, Snackbar } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pedometer } from "expo-sensors";
import * as Location from 'expo-location';
// import { registerForPushNotificationsAsync, sendLocalNotification } from '../services/NotificationService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { user, logout, updateUserRole, viewRole } = useContext(AuthContext);
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);

  const isAdminView = viewRole === 'ADMIN';
  const isDoctorView = viewRole === 'DOCTOR';
  const [greeting, setGreeting] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [locationName, setLocationName] = useState("Locating...");
  const [currentDate, setCurrentDate] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [addPatientModalVisible, setAddPatientModalVisible] = useState(false);

  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");

  const handleAddPatient = () => {
    if (!newPatientName || !newPatientAge) {
      setSnackbarMessage("Please enter patient name and age");
      setSnackbarVisible(true);
      return;
    }
    setSnackbarMessage(`Patient ${newPatientName} added successfully!`);
    setSnackbarVisible(true);
    setAddPatientModalVisible(false);
    // Reset form
    setNewPatientName("");
    setNewPatientAge("");
    setNewPatientGender("");
    setNewPatientPhone("");
  };

  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [pedometerStatus, setPedometerStatus] = useState('checking');

  useEffect(() => {
    (async () => {
      try {
        // Check existing permission first
        let { status } = await Location.getForegroundPermissionsAsync();

        // Only request if not already granted
        if (status !== 'granted') {
          const request = await Location.requestForegroundPermissionsAsync();
          status = request.status;
        }

        if (status !== 'granted') {
          setLocationName('Permission denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          setLocationName(`${address.city || address.region}, ${address.country}`);
        }
      } catch (error) {
        console.log("Location error:", error);
        setLocationName('Location unavailable');
      }
    })();

    const updateDateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString(undefined, options));
    };

    updateDateTime();
    // Update every minute just in case
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let subscription;
    let hasPermission = false;

    const subscribe = () => {
      if (hasPermission && !subscription) {
        subscription = Pedometer.watchStepCount(result => {
          setCurrentStepCount(result.steps);
        });
      }
    };

    const unsubscribe = () => {
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
    };

    const checkPermissionsAndInit = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setPedometerStatus(isAvailable ? 'available' : 'unavailable');

        if (isAvailable) {
          // Check existing permission first
          let { status } = await Pedometer.getPermissionsAsync();

          // Only request if not undetermined/granted (though usually we just request if not granted)
          if (status !== 'granted') {
            const perm = await Pedometer.requestPermissionsAsync();
            status = perm.status;
          }

          if (status !== 'granted') {
            setPedometerStatus('denied');
            hasPermission = false;
          } else {
            setPedometerStatus('available');
            hasPermission = true;

            // Fetch past steps
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            try {
              const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
              if (pastStepCountResult) {
                setCurrentStepCount(pastStepCountResult.steps);
              }
            } catch (e) {
              console.log("Failed to fetch past steps", e);
            }

            // Start watching
            subscribe();
          }
        }
      } catch (error) {
        setPedometerStatus('error');
        console.error("Pedometer error:", error);
      }
    };

    // Initial start - Request permissions ONLY here
    checkPermissionsAndInit();

    // AppState listener
    const subscriptionAppState = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // ONLY subscribe, do NOT request permissions again
        subscribe();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        unsubscribe();
      }
    });

    return () => {
      unsubscribe();
      subscriptionAppState.remove();
    };
  }, []);



  const changeRole = (role) => {
    updateUserRole(role);
    setModalVisible(false);
    setSnackbarMessage(`Switched to ${role} view`);
    setSnackbarVisible(true);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';

  const StatCard = ({ icon, label, value, color }) => (
    <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text variant="labelMedium" style={{ color: theme.colors.outline }}>{label}</Text>
        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{value}</Text>
      </View>
    </Surface>
  );

  const HealthStatCard = ({ icon, label, value, subValue, color, theme, isDark, status }) => {
    // Glass/Liquid UI Colors
    // In dark mode, we want a dark background with a tint of the color.
    // We use a solid dark color with opacity to ensure it looks dark even if the parent is weird.
    const lightGradient = [color + '20', color + '05'];
    const darkGradient = ['#1E1E1E', color + '30']; // Dark grey to tinted color

    const borderColor = isDark ? color + '80' : color + '40';
    const iconBg = isDark ? '#2C2C2C' : 'white';
    const textColor = isDark ? '#E0E0E0' : theme.colors.onSurface;
    const subTextColor = isDark ? '#AAAAAA' : theme.colors.outline;

    return (
      <LinearGradient
        colors={isDark ? darkGradient : lightGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.healthCard,
          {
            borderColor: borderColor,
            borderWidth: 1,
            backgroundColor: isDark ? '#121212' : 'transparent' // Fallback/Base
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconBg, borderRadius: 20, padding: 8 }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text variant="labelMedium" style={{ marginTop: 8, color: textColor, opacity: 0.9 }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Text variant="titleMedium" adjustsFontSizeToFit numberOfLines={1} style={{ fontWeight: 'bold', color: isDark ? 'white' : theme.colors.onSurface }}>{value}</Text>
          <Text variant="titleMedium" adjustsFontSizeToFit numberOfLines={1} style={{ fontWeight: 'bold', color: subTextColor, marginLeft: 4, opacity: 0.7 }}>{subValue}</Text>
        </View>
        {status ? (
          <Text style={{ position: 'absolute', bottom: 6, fontSize: 8, color: theme.colors.error }}>
            {status}
          </Text>
        ) : null}
      </LinearGradient>
    );
  };

  const ActionButton = ({ icon, label, onPress, color }) => (
    <Button
      mode="contained"
      onPress={onPress}
      style={[styles.actionButton, { backgroundColor: color }]}
      contentStyle={styles.actionButtonContent}
      icon={icon}
    >
      {label}
    </Button>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="bodyLarge" style={styles.greeting}>{greeting},</Text>
              <Text variant="headlineMedium" style={styles.userName}>
                {isDoctorView ? `Dr. ${user?.name}` : user?.name}
              </Text>
              <View style={{ marginTop: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  <MaterialCommunityIcons name="map-marker" size={12} /> {locationName}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  {currentDate}
                </Text>
              </View>

              {user?.role === 'ADMIN' && (
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(true)}
                  style={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    marginTop: 4,
                    alignSelf: 'flex-start',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }}
                  textColor="white"
                  compact
                  contentStyle={{ height: 28 }}
                  labelStyle={{ fontSize: 10, marginVertical: 0, marginHorizontal: 8 }}
                >
                  {viewRole || 'PATIENT'} ▾
                </Button>
              )}

            </View>
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="bell"
                iconColor="white"
                size={24}
                onPress={() => navigation.navigate('Reminders')}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 }}
              />
              <IconButton
                icon={isDark ? "weather-sunny" : "weather-night"}
                iconColor="white"
                size={24}
                onPress={toggleTheme}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 }}
              />
              <IconButton
                icon="logout"
                iconColor="white"
                size={24}
                onPress={logout}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            {isAdminView ? (
              <>
                <StatCard icon="calendar-check" label="Appointments" value="136" color="#4CAF50" />
                <StatCard icon="account-group" label="Total Patients" value="1,240" color="#2196F3" />
              </>
            ) : isDoctorView ? (
              <>
                <StatCard icon="calendar-check" label="Appointments" value="8" color="#4CAF50" />
                <StatCard icon="account-group" label="Patients" value="142" color="#2196F3" />
              </>
            ) : (
              <>
                <StatCard icon="calendar-clock" label="Upcoming" value="2" color="#FF9800" />
                <StatCard icon="file-document-outline" label="Records" value="12" color="#9C27B0" />
              </>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Main Dashboard Content */}
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {isAdminView ? "Hospital Administration" : (isDoctorView ? "Today's Schedule" : "Your Health Overview")}
          </Text>

          {isAdminView ? (
            <View>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, opacity: 0.8, marginTop: 0 }]}>
                Doctor Schedule & Actions
              </Text>
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
                <Card.Content>
                  <View style={styles.appointmentItem}>
                    <View style={styles.timeContainer}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>09:00</Text>
                      <Text variant="labelSmall">AM</Text>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text variant="titleMedium">Sarah Johnson</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>General Checkup</Text>
                    </View>
                    <Button mode="text" compact>View</Button>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.appointmentItem}>
                    <View style={styles.timeContainer}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>10:30</Text>
                      <Text variant="labelSmall">AM</Text>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text variant="titleMedium">Mike Chen</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Follow-up</Text>
                    </View>
                    <Button mode="text" compact>View</Button>
                  </View>
                </Card.Content>
              </Card>

              <View style={[styles.actionGrid, { marginTop: 16, marginBottom: 24 }]}>
                <ActionButton icon="account-plus" label="Add Patient" onPress={() => navigation.navigate('Appointments', { openAddPatient: true })} color="#6200ee" />
                <ActionButton icon="calendar-plus" label="Schedule" onPress={() => navigation.navigate('Appointments')} color="#009688" />
              </View>

              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, opacity: 0.8 }]}>
                Patient Health Overview
              </Text>
              <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginBottom: 16 }]} mode="elevated">
                <Card.Cover source={{ uri: 'https://img.freepik.com/free-vector/medical-checkup-concept-illustration_114360-1702.jpg' }} style={{ height: 150 }} />
                <Card.Content style={{ paddingTop: 16 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Next Appointment</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text variant="bodyMedium">Tomorrow, 10:00 AM</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="doctor" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text variant="bodyMedium">Dr. Sarah Smith (Cardiologist)</Text>
                  </View>
                </Card.Content>
              </Card>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <HealthStatCard
                  icon="water"
                  label="Hydration"
                  value="75%"
                  subValue="Goal"
                  color="#2196F3"
                  theme={theme}
                  isDark={isDark}
                />
                <HealthStatCard
                  icon="run"
                  label="Steps"
                  value={`${currentStepCount}`}
                  subValue="/ 10k"
                  color="#4CAF50"
                  theme={theme}
                  isDark={isDark}
                />
                <HealthStatCard
                  icon="sleep"
                  label="Sleep"
                  value="7h"
                  subValue="30m"
                  color="#FF9800"
                  theme={theme}
                  isDark={isDark}
                />
              </View>
            </View>

          ) : isDoctorView ? (
            <View>
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
                <Card.Content>
                  <View style={styles.appointmentItem}>
                    <View style={styles.timeContainer}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>09:00</Text>
                      <Text variant="labelSmall">AM</Text>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text variant="titleMedium">Sarah Johnson</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>General Checkup</Text>
                    </View>
                    <Button mode="text" compact onPress={() => setDetailsModalVisible(true)}>View</Button>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.appointmentItem}>
                    <View style={styles.timeContainer}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>10:30</Text>
                      <Text variant="labelSmall">AM</Text>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text variant="titleMedium">Mike Chen</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Follow-up</Text>
                    </View>
                    <Button mode="text" compact onPress={() => setDetailsModalVisible(true)}>View</Button>
                  </View>
                </Card.Content>
              </Card>

              <Text variant="titleLarge" style={[styles.sectionTitle, { marginTop: 24, color: theme.colors.onSurface }]}>
                Quick Actions
              </Text>
              <View style={styles.actionGrid}>
                <ActionButton
                  icon="account-plus"
                  label="Add Patient"
                  onPress={() => navigation.navigate('Appointments', { openAddPatient: true })}
                  color="#6200ee"
                />
                <ActionButton icon="calendar-plus" label="Schedule" onPress={() => navigation.navigate('Appointments')} color="#009688" />
              </View>

              <Text variant="titleLarge" style={[styles.sectionTitle, { marginTop: 24, color: theme.colors.onSurface }]}>
                Health Status
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <HealthStatCard
                  icon="water"
                  label="Hydration"
                  value="75%"
                  subValue="Goal"
                  color="#2196F3"
                  theme={theme}
                  isDark={isDark}
                />
                <HealthStatCard
                  icon="run"
                  label="Steps"
                  value={`${currentStepCount}`}
                  subValue="/ 10k"
                  color="#4CAF50"
                  theme={theme}
                  isDark={isDark}
                />
                <HealthStatCard
                  icon="sleep"
                  label="Sleep"
                  value="7h"
                  subValue="30m"
                  color="#FF9800"
                  theme={theme}
                  isDark={isDark}
                />
              </View>
            </View>
          ) : (
            <View>
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
                <Card.Cover source={{ uri: 'https://img.freepik.com/free-vector/medical-checkup-concept-illustration_114360-1702.jpg' }} style={{ height: 150 }} />
                <Card.Content style={{ paddingTop: 16 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Next Appointment</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text variant="bodyMedium">Tomorrow, 10:00 AM</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="doctor" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text variant="bodyMedium">Dr. Sarah Smith (Cardiologist)</Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => setDetailsModalVisible(true)}>View Details</Button>
                </Card.Actions>
              </Card>

              <Text variant="titleLarge" style={[styles.sectionTitle, { marginTop: 24, color: theme.colors.onSurface }]}>
                Health Status
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <HealthStatCard
                  icon="water"
                  label="Hydration"
                  value="75%"
                  subValue="Goal"
                  color="#2196F3"
                  theme={theme}
                  isDark={isDark}
                />
                <HealthStatCard
                  icon="run"
                  label="Steps"
                  value={`${currentStepCount}`}
                  subValue="/ 10k"
                  color="#4CAF50"
                  theme={theme}
                  isDark={isDark}
                />
                <HealthStatCard
                  icon="sleep"
                  label="Sleep"
                  value="7h"
                  subValue="30m"
                  color="#FF9800"
                  theme={theme}
                  isDark={isDark}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView >

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Native Modal for Role Switching */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>Switch Role</Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonOpen]}
              onPress={() => changeRole('PATIENT')}
            >
              <MaterialCommunityIcons name="account" size={20} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.textStyle}>Patient View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonOpen, { marginTop: 10 }]}
              onPress={() => changeRole('DOCTOR')}
            >
              <MaterialCommunityIcons name="doctor" size={20} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.textStyle}>Doctor View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonOpen, { marginTop: 10 }]}
              onPress={() => changeRole('ADMIN')}
            >
              <MaterialCommunityIcons name="shield-account" size={20} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.textStyle}>Admin View</Text>
            </TouchableOpacity>

            <Button
              mode="text"
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 20 }}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: theme.colors.surface, width: '90%' }]}>
            <Text style={[styles.modalText, { color: theme.colors.onSurface, marginBottom: 20 }]}>Appointment Details</Text>

            <View style={{ width: '100%', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <MaterialCommunityIcons name="doctor" size={30} color={theme.colors.primary} />
                </View>
                <View>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Dr. Sarah Smith</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>Cardiologist</Text>
                </View>
              </View>

              <View style={{ backgroundColor: theme.colors.background, padding: 16, borderRadius: 12, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.outline} style={{ width: 30 }} />
                  <Text variant="bodyMedium">Tomorrow, 24 Nov 2025</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.outline} style={{ width: 30 }} />
                  <Text variant="bodyMedium">10:00 AM - 10:30 AM</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.outline} style={{ width: 30 }} />
                  <Text variant="bodyMedium">City Heart Center, Room 302</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color={theme.colors.outline} style={{ width: 30 }} />
                  <Text variant="bodyMedium">Checkup & Report Review</Text>
                </View>
              </View>

              <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
                <Button mode="outlined" style={{ flex: 1 }} onPress={() => setDetailsModalVisible(false)}>
                  Close
                </Button>
                <Button mode="contained" style={{ flex: 1 }} onPress={() => {
                  setDetailsModalVisible(false);
                  navigation.navigate('Appointments');
                }}>
                  Manage
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
  },
  userRole: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  appointmentDetails: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  healthCard: {
    width: (width - 60) / 3,
    height: 140, // Fixed height to prevent shaking
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // For absolute positioning of status
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  buttonOpen: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold',
  }
});
