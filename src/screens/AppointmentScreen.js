import React, { useContext, useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ScrollView } from "react-native";
import { Appbar, Text, Card, Button, Portal, Modal, TextInput, Snackbar, FAB } from "react-native-paper";
import { ThemeContext } from "../context/ThemeContext";
import { doctorService } from "../services/doctorService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppointmentScanner from "../components/AppointmentScanner";

export default function AppointmentScreen() {
  const { theme } = useContext(ThemeContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setModalVisible(true);
  };

  const handleConfirmBooking = () => {
    if (!appointmentDate || !appointmentTime) {
      setSnackbarMessage("Please enter date and time");
      setSnackbarVisible(true);
      return;
    }

    setSnackbarMessage(`Appointment booked with ${selectedDoctor.name}`);
    setSnackbarVisible(true);
    setModalVisible(false);
    setAppointmentDate("");
    setAppointmentTime("");
    setNotes("");
    setSelectedDoctor(null);
  };

  const handleScanComplete = (scannedData) => {
    setAppointmentDate(scannedData.date || "");
    setAppointmentTime(scannedData.time || "");
    setNotes(scannedData.notes || "");
    setScannerVisible(false);
    
    setSnackbarMessage("Appointment details extracted! Please review and select a doctor.");
    setSnackbarVisible(true);
  };

  const renderDoctorCard = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <MaterialCommunityIcons
              name="doctor"
              size={40}
              color={theme.colors.primary}
            />
            <View style={styles.doctorDetails}>
              <Text variant="titleMedium" style={{ color: theme.colors.text }}>
                {item.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                {item.specialty}
              </Text>
              {item.phone && (
                <Text variant="bodySmall" style={{ color: theme.colors.text, opacity: 0.7 }}>
                  {item.phone}
                </Text>
              )}
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => handleBookAppointment(item)}
            style={styles.bookButton}
            compact
          >
            Book
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Book Appointment" titleStyle={{ color: "#fff" }} />
        <Appbar.Action 
          icon="camera" 
          color="#fff"
          onPress={() => setScannerVisible(!scannerVisible)} 
        />
      </Appbar.Header>

      {scannerVisible && (
        <AppointmentScanner 
          onScanComplete={handleScanComplete}
          theme={theme}
        />
      )}

      {doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={80}
            color={theme.colors.primary}
          />
          <Text variant="titleLarge" style={[styles.emptyText, { color: theme.colors.text }]}>
            No doctors available
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.text, opacity: 0.6 }}>
            Add doctors from the Home screen first
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

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Book Appointment
            </Text>
            
            {selectedDoctor && (
              <View style={styles.doctorInfoModal}>
                <Text variant="titleMedium" style={{ color: theme.colors.text }}>
                  {selectedDoctor.name}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                  {selectedDoctor.specialty}
                </Text>
              </View>
            )}

            <TextInput
              label="Date (DD/MM/YYYY)"
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              mode="outlined"
              placeholder="01/10/2025"
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
            />

            <TextInput
              label="Time (HH:MM)"
              value={appointmentTime}
              onChangeText={setAppointmentTime}
              mode="outlined"
              placeholder="10:00 AM"
              style={styles.input}
              left={<TextInput.Icon icon="clock-outline" />}
            />

            <TextInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              left={<TextInput.Icon icon="note-text" />}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmBooking}
                style={styles.button}
              >
                Confirm
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

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
    alignItems: "center",
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  bookButton: {
    borderRadius: 12,
    elevation: 4,
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
  modal: {
    padding: 24,
    margin: 20,
    borderRadius: 24,
    maxHeight: "80%",
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 238, 0.2)',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  doctorInfoModal: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "rgba(98, 0, 238, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(98, 0, 238, 0.15)",
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    elevation: 4,
  },
});
