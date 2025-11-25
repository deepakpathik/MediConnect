import React, { useContext, useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, Card, Button, Portal, Modal, TextInput, Snackbar, SegmentedButtons, Chip, Badge, FAB, Searchbar } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { doctorService } from "../services/doctorService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppointmentScanner from "../components/AppointmentScanner";

export default function AppointmentScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const { viewRole } = useContext(AuthContext); // Get viewRole
  const isDoctorView = viewRole === 'DOCTOR';

  const [viewMode, setViewMode] = useState('book'); // 'book' or 'saved'
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [doctorFilter, setDoctorFilter] = useState('all');

  useEffect(() => {
    if (route.params?.openAddPatient) {
      setIsAddingAppointment(true);
      // Reset param so it doesn't reopen if we navigate back and forth without intent
      navigation.setParams({ openAddPatient: false });
    }
  }, [route.params]);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");

  const [addDoctorVisible, setAddDoctorVisible] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState("");
  const [newDoctorPhone, setNewDoctorPhone] = useState("");

  const [savedAppointments, setSavedAppointments] = useState([
    { id: '1', title: 'Dr. Smith - Cardiology', date: '2025-10-15', time: '10:00 AM', type: 'booked', status: 'upcoming', notes: 'Regular checkup' },
    { id: '2', title: 'Lab Test - Blood Work', date: '2025-09-20', time: '08:30 AM', type: 'scanned', status: 'completed', notes: 'Fasting required' },
    { id: '3', title: 'Dr. Jane - Dentist', date: '2025-11-01', time: '02:00 PM', type: 'booked', status: 'cancelled', notes: 'Rescheduled' },
  ]);

  const [doctorAppointments, setDoctorAppointments] = useState([
    { id: 'd1', title: 'John Doe', date: '2025-11-25', time: '09:00 AM', type: 'manual', status: 'upcoming', notes: 'High fever', medicalHistory: 'Asthma' },
    { id: 'd2', title: 'Sarah Connor', date: '2025-11-25', time: '10:30 AM', type: 'manual', status: 'upcoming', notes: 'Routine checkup', medicalHistory: 'None' },
    { id: 'd3', title: 'Mike Ross', date: '2025-11-24', time: '02:00 PM', type: 'manual', status: 'completed', notes: 'Follow up', medicalHistory: 'Hypertension' },
  ]);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanMode, setScanMode] = useState('appointment'); // 'appointment' or 'doctor'

  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

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

    const newAppointment = {
      id: Date.now().toString(),
      title: `Dr. ${selectedDoctor.name} - ${selectedDoctor.specialty}`,
      date: appointmentDate,
      time: appointmentTime,
      type: 'booked',
      status: 'upcoming',
      notes: notes
    };

    setSavedAppointments([newAppointment, ...savedAppointments]);
    setSnackbarMessage(`Appointment booked with ${selectedDoctor.name}`);
    setSnackbarVisible(true);
    setModalVisible(false);
    setAppointmentDate("");
    setAppointmentTime("");
    setNotes("");
    setSelectedDoctor(null);
    setViewMode('saved'); // Switch to saved view to show the new appointment
  };

  const handleScanComplete = (scannedData) => {
    if (scanMode === 'doctor') {
      setNewDoctorName(scannedData.doctorName || "");
      setNewDoctorSpecialty(scannedData.specialty || "");
      setNewDoctorPhone(scannedData.phone || "");
      setScannerVisible(false);
      setAddDoctorVisible(true); // Re-open the modal
      setSnackbarMessage("Doctor details scanned!");
      setSnackbarVisible(true);
    } else {
      const newScannedAppointment = {
        id: Date.now().toString(),
        title: scannedData.doctorName || "Scanned Appointment",
        date: scannedData.date || new Date().toLocaleDateString(),
        time: scannedData.time || "TBD",
        type: 'scanned',
        status: 'upcoming',
        notes: scannedData.notes || "Imported from physical slip"
      };

      setSavedAppointments([newScannedAppointment, ...savedAppointments]);
      setScannerVisible(false);
      setSnackbarMessage("Appointment slip scanned and saved!");
      setSnackbarVisible(true);
      setViewMode('saved'); // Switch to saved view
    }
  };

  const handleAddDoctor = () => {
    if (!newDoctorName || !newDoctorSpecialty) {
      setSnackbarMessage("Please enter Name and Specialty");
      setSnackbarVisible(true);
      return;
    }

    const newDoctor = {
      id: Date.now().toString(),
      name: newDoctorName,
      specialty: newDoctorSpecialty,
      phone: newDoctorPhone,
      image: "https://via.placeholder.com/150" // Placeholder image
    };

    setDoctors([newDoctor, ...doctors]);
    setAddDoctorVisible(false);
    setNewDoctorName("");
    setNewDoctorSpecialty("");
    setNewDoctorPhone("");
    setSnackbarMessage("New doctor added!");
    setSnackbarVisible(true);
  };

  const startDoctorScan = () => {
    setAddDoctorVisible(false); // Close modal temporarily
    setScanMode('doctor');
    setScannerVisible(true);
  };

  const cancelAppointment = (id) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            setSavedAppointments(savedAppointments.map(app =>
              app.id === id ? { ...app, status: 'cancelled' } : app
            ));
            setSnackbarMessage("Appointment cancelled");
            setSnackbarVisible(true);
          }
        }
      ]
    );
  };

  const rescheduleAppointment = (id) => {
    const appointment = savedAppointments.find(app => app.id === id);
    if (appointment) {
      setRescheduleAppointmentId(id);
      setNewDate(appointment.date);
      setNewTime(appointment.time);
      setRescheduleModalVisible(true);
    }
  };

  const confirmReschedule = () => {
    if (!newDate || !newTime) {
      setSnackbarMessage("Please enter new date and time");
      setSnackbarVisible(true);
      return;
    }

    setSavedAppointments(savedAppointments.map(app =>
      app.id === rescheduleAppointmentId
        ? { ...app, date: newDate, time: newTime, notes: app.notes ? `${app.notes} (Rescheduled)` : '(Rescheduled)' }
        : app
    ));

    setRescheduleModalVisible(false);
    setSnackbarMessage("Appointment rescheduled successfully!");
    setSnackbarVisible(true);
    setRescheduleAppointmentId(null);
  };

  const getFilteredAppointments = () => {
    let filtered = isDoctorView ? doctorAppointments : savedAppointments;

    if (searchQuery) {
      filtered = filtered.filter(a =>
        (a.title && a.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.patientName && a.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.medicalHistory && a.medicalHistory.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    const activeFilter = isDoctorView ? doctorFilter : filter;

    if (activeFilter === 'upcoming') return filtered.filter(app => app.status === 'upcoming');
    if (activeFilter === 'past') return filtered.filter(app => app.status === 'completed' || app.status === 'cancelled');

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return theme.colors.primary;
      case 'completed': return '#4CAF50'; // Green
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.outline;
    }
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

  const handleAddAppointment = () => {
    if (!patientName || !appointmentDate || !appointmentTime) {
      setSnackbarMessage("Please enter patient name, date, and time");
      setSnackbarVisible(true);
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      title: patientName, // In Doctor view, this is the Patient Name
      specialty: "General Checkup",
      date: appointmentDate,
      time: appointmentTime,
      notes: appointmentNotes,
      medicalHistory: medicalHistory,
      status: 'upcoming',
      type: 'manual'
    };

    setSavedAppointments([...savedAppointments, newAppointment]);
    setSnackbarMessage("Appointment added successfully!");
    setSnackbarVisible(true);

    // Reset form
    setPatientName("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentNotes("");
    setMedicalHistory("");
    setIsAddingAppointment(false); // Return to Queue
  };

  const renderAppointmentItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface, opacity: item.status === 'cancelled' ? 0.7 : 1 }]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'booked' || item.type === 'manual' ? theme.colors.primary + '20' : '#FF980020' }]}>
              <MaterialCommunityIcons
                name={item.type === 'booked' || item.type === 'manual' ? "calendar-check" : "file-document-outline"}
                size={24}
                color={item.type === 'booked' || item.type === 'manual' ? theme.colors.primary : '#FF9800'}
              />
            </View>
            <View style={styles.doctorDetails}>
              <Text variant="titleMedium" style={{ color: theme.colors.text, fontWeight: 'bold', textDecorationLine: item.status === 'cancelled' ? 'line-through' : 'none' }}>
                {item.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.outline} style={{ marginRight: 4 }} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginRight: 12 }}>
                  {item.date}
                </Text>
                <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.outline} style={{ marginRight: 4 }} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {item.time}
                </Text>
              </View>
              {isDoctorView && item.medicalHistory ? (
                <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>History: </Text>{item.medicalHistory}
                </Text>
              ) : null}
              {item.notes ? (
                <Text variant="bodySmall" style={{ color: theme.colors.text, opacity: 0.7, marginTop: 4 }}>
                  {item.notes}
                </Text>
              ) : null}
            </View>
          </View>
          <Chip
            compact
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status), fontSize: 10 }}
            style={{ borderColor: getStatusColor(item.status) }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        {item.status === 'upcoming' && (
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              compact
              textColor={theme.colors.error}
              style={{ borderColor: theme.colors.error, flex: 1, marginRight: 8 }}
              onPress={() => cancelAppointment(item.id)}
            >
              Cancel
            </Button>
            <Button
              mode="outlined"
              compact
              textColor={theme.colors.primary}
              style={{ borderColor: theme.colors.primary, flex: 1 }}
              onPress={() => rescheduleAppointment(item.id)}
            >
              Reschedule
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const DoctorStats = () => (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
      <Card style={{ flex: 1, backgroundColor: theme.colors.primaryContainer }}>
        <Card.Content style={{ alignItems: 'center', padding: 12 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            {doctorAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
          </Text>
          <Text variant="labelSmall" style={{ textAlign: 'center' }}>Today</Text>
        </Card.Content>
      </Card>
      <Card style={{ flex: 1, backgroundColor: theme.colors.secondaryContainer }}>
        <Card.Content style={{ alignItems: 'center', padding: 12 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
            {doctorAppointments.filter(a => a.status === 'upcoming').length}
          </Text>
          <Text variant="labelSmall" style={{ textAlign: 'center' }}>Pending</Text>
        </Card.Content>
      </Card>
      <Card style={{ flex: 1, backgroundColor: theme.colors.tertiaryContainer }}>
        <Card.Content style={{ alignItems: 'center', padding: 12 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.tertiary }}>
            {doctorAppointments.filter(a => a.status === 'completed').length}
          </Text>
          <Text variant="labelSmall" style={{ textAlign: 'center' }}>Done</Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        {isDoctorView && isAddingAppointment ? (
          <Appbar.BackAction onPress={() => setIsAddingAppointment(false)} color="#fff" />
        ) : null}
        <Appbar.Content title={isDoctorView ? "Patient Management" : "Appointments"} color="#fff" />
        {(!isDoctorView && viewMode === 'saved') || (isDoctorView && isAddingAppointment) ? (
          <Appbar.Action icon="camera" color="#fff" onPress={() => {
            setScanMode('appointment');
            setScannerVisible(true);
          }} />
        ) : null}
      </Appbar.Header>

      <View style={styles.content}>
        {isDoctorView ? (
          isAddingAppointment ? (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text variant="headlineSmall" style={{ marginBottom: 16, fontWeight: 'bold', color: theme.colors.primary }}>
                New Patient Entry
              </Text>
              <Card style={{ backgroundColor: theme.colors.surface }}>
                <Card.Content>
                  <TextInput
                    label="Patient Name"
                    value={patientName}
                    onChangeText={setPatientName}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                  />
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TextInput
                      label="Date (YYYY-MM-DD)"
                      value={appointmentDate}
                      onChangeText={setAppointmentDate}
                      mode="outlined"
                      style={[styles.input, { flex: 1 }]}
                      left={<TextInput.Icon icon="calendar" />}
                    />
                    <TextInput
                      label="Time"
                      value={appointmentTime}
                      onChangeText={setAppointmentTime}
                      mode="outlined"
                      style={[styles.input, { flex: 1 }]}
                      left={<TextInput.Icon icon="clock" />}
                    />
                  </View>
                  <TextInput
                    label="Medical History / Conditions"
                    value={medicalHistory}
                    onChangeText={setMedicalHistory}
                    mode="outlined"
                    multiline
                    style={styles.input}
                    left={<TextInput.Icon icon="history" />}
                  />
                  <TextInput
                    label="Notes / Purpose"
                    value={appointmentNotes}
                    onChangeText={setAppointmentNotes}
                    mode="outlined"
                    multiline
                    style={styles.input}
                    left={<TextInput.Icon icon="note-text" />}
                  />

                  <Button
                    mode="contained"
                    onPress={handleAddAppointment}
                    style={{ marginTop: 16 }}
                    icon="check"
                  >
                    Confirm Appointment
                  </Button>
                </Card.Content>
              </Card>
            </ScrollView>
          ) : (
            <View style={{ flex: 1, padding: 16 }}>
              <DoctorStats />

              <Searchbar
                placeholder="Search patients..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchBar, { marginBottom: 16 }]}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Patient Queue</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Chip compact selected={doctorFilter === 'all'} onPress={() => setDoctorFilter('all')}>All</Chip>
                  <Chip compact selected={doctorFilter === 'upcoming'} onPress={() => setDoctorFilter('upcoming')}>Pending</Chip>
                  <Chip compact selected={doctorFilter === 'past'} onPress={() => setDoctorFilter('past')}>Done</Chip>
                </View>
              </View>

              <FlatList
                data={getFilteredAppointments()}
                keyExtractor={(item) => item.id}
                renderItem={renderAppointmentItem}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>No patients found</Text>
                  </View>
                }
              />

              <FAB
                icon="plus"
                label="Add Patient"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="#fff"
                onPress={() => setIsAddingAppointment(true)}
              />
            </View>
          )
        ) : (
          <>
            <View style={{ padding: 16, paddingBottom: 8 }}>
              <SegmentedButtons
                value={viewMode}
                onValueChange={setViewMode}
                buttons={[
                  {
                    value: 'book',
                    label: 'Book New',
                    icon: 'doctor',
                    style: { backgroundColor: viewMode === 'book' ? theme.colors.secondaryContainer : 'transparent' }
                  },
                  {
                    value: 'saved',
                    label: 'My Appointments',
                    icon: 'calendar-account',
                    style: { backgroundColor: viewMode === 'saved' ? theme.colors.secondaryContainer : 'transparent' }
                  },
                ]}
              />
            </View>

            {scannerVisible && (
              <AppointmentScanner
                onScanComplete={handleScanComplete}
                theme={theme}
                onClose={() => setScannerVisible(false)}
              />
            )}

            {viewMode === 'book' ? (
              <View style={{ flex: 1 }}>
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
                      Add doctors to start booking
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
                <FAB
                  icon="plus"
                  style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                  color="#fff"
                  onPress={() => setAddDoctorVisible(true)}
                  label="Add Doctor"
                />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <View style={styles.statsContainer}>
                  <View style={[styles.statCard, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}>
                    <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      {savedAppointments.filter(a => a.status === 'upcoming').length}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>Upcoming</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: '#4CAF5015', borderColor: '#4CAF5030' }]}>
                    <Text variant="displaySmall" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {savedAppointments.filter(a => a.status === 'completed').length}
                    </Text>
                    <Text variant="labelMedium" style={{ color: '#4CAF50' }}>Done</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '30' }]}>
                    <Text variant="displaySmall" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                      {savedAppointments.filter(a => a.status === 'cancelled' || a.status === 'missed').length}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.error, textAlign: 'center' }}>Cancelled / Missed</Text>
                  </View>
                </View>

                {viewMode === 'saved' && (
                  <View style={styles.filterContainer}>
                    <Chip
                      selected={filter === 'all'}
                      onPress={() => setFilter('all')}
                      style={styles.filterChip}
                      showSelectedOverlay
                    >
                      All
                    </Chip>
                    <Chip
                      selected={filter === 'upcoming'}
                      onPress={() => setFilter('upcoming')}
                      style={styles.filterChip}
                      showSelectedOverlay
                    >
                      Upcoming
                    </Chip>
                    <Chip
                      selected={filter === 'past'}
                      onPress={() => setFilter('past')}
                      style={styles.filterChip}
                      showSelectedOverlay
                    >
                      Past
                    </Chip>
                  </View>
                )}

                {getFilteredAppointments().length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                      name="calendar-blank"
                      size={80}
                      color={theme.colors.outline}
                    />
                    <Text variant="titleLarge" style={[styles.emptyText, { color: theme.colors.text }]}>
                      No {filter !== 'all' ? filter : ''} appointments
                    </Text>
                    {filter === 'all' && (
                      <>
                        <Button mode="contained" onPress={() => setViewMode('book')} style={{ marginTop: 16 }}>
                          Book Now
                        </Button>
                        <Button mode="outlined" onPress={() => {
                          setScanMode('appointment');
                          setScannerVisible(true);
                        }} style={{ marginTop: 12 }}>
                          Scan Slip
                        </Button>
                      </>
                    )}
                  </View>
                ) : (
                  <FlatList
                    data={getFilteredAppointments()}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAppointmentItem}
                    contentContainerStyle={styles.listContent}
                  />
                )}
              </View>
            )}
          </>
        )}
      </View>

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

        <Modal
          visible={addDoctorVisible}
          onDismiss={() => setAddDoctorVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Add New Doctor
            </Text>

            <Button
              mode="outlined"
              icon="camera"
              onPress={startDoctorScan}
              style={{ marginBottom: 16, borderColor: theme.colors.primary }}
              textColor={theme.colors.primary}
            >
              Scan Business Card
            </Button>

            <TextInput
              label="Doctor Name"
              value={newDoctorName}
              onChangeText={setNewDoctorName}
              mode="outlined"
              placeholder="Dr. John Doe"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Specialty"
              value={newDoctorSpecialty}
              onChangeText={setNewDoctorSpecialty}
              mode="outlined"
              placeholder="Cardiologist"
              style={styles.input}
              left={<TextInput.Icon icon="doctor" />}
            />

            <TextInput
              label="Phone (Optional)"
              value={newDoctorPhone}
              onChangeText={setNewDoctorPhone}
              mode="outlined"
              placeholder="555-1234"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setAddDoctorVisible(false)}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddDoctor}
                style={styles.button}
              >
                Save Doctor
              </Button>
            </View>
          </ScrollView>
        </Modal>

        {/* Reschedule Modal */}
        <Modal
          visible={rescheduleModalVisible}
          onDismiss={() => setRescheduleModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Reschedule Appointment
            </Text>

            <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.text }}>
              Select a new date and time for your appointment.
            </Text>

            <TextInput
              label="New Date (DD/MM/YYYY)"
              value={newDate}
              onChangeText={setNewDate}
              mode="outlined"
              placeholder="25/12/2025"
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
            />

            <TextInput
              label="New Time (HH:MM)"
              value={newTime}
              onChangeText={setNewTime}
              mode="outlined"
              placeholder="02:00 PM"
              style={styles.input}
              left={<TextInput.Icon icon="clock-outline" />}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setRescheduleModalVisible(false)}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={confirmReschedule}
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
});
