import React, { useContext, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Appbar, Text, Card, Checkbox, FAB, Surface, Chip, TextInput, Button } from "react-native-paper";
import { ThemeContext } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native-paper';

export default function ReminderScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);

  const [reminders, setReminders] = useState([
    { id: '1', title: 'Amoxicillin', time: '08:00 AM', type: 'Medication', completed: true, dosage: '500mg' },
    { id: '2', title: 'Drink Water', time: '09:00 AM', type: 'Hydration', completed: false, dosage: '250ml' },
    { id: '3', title: 'Vitamin D', time: '12:00 PM', type: 'Medication', completed: false, dosage: '1 Tablet' },
    { id: '4', title: 'Walk', time: '05:00 PM', type: 'Exercise', completed: false, dosage: '30 mins' },
    { id: '5', title: 'Ibuprofen', time: '08:00 PM', type: 'Medication', completed: false, dosage: '200mg' },
  ]);

  const toggleReminder = (id) => {
    setReminders(reminders.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Medication': return 'pill';
      case 'Hydration': return 'water';
      case 'Exercise': return 'walk';
      default: return 'bell';
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'Medication': return '#FF4081'; // Pink
      case 'Hydration': return '#2196F3'; // Blue
      case 'Exercise': return '#4CAF50'; // Green
      default: return '#FF9800'; // Orange
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState('Medication');
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setScanning(true);

      setScanning(true);

      setTimeout(() => {
        const mockDetectedText = "Amoxicillin 500mg";

        setNewTitle(mockDetectedText);
        setNewType('Medication');
        setScanning(false);
        alert(`Scanned: ${mockDetectedText}`);
      }, 2000);
    }
  };

  const addReminder = () => {
    if (newTitle.trim() === '') return;

    const newReminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime || '09:00 AM', // Default time if empty
      type: newType,
      completed: false,
      dosage: newType === 'Medication' ? '1 pill' : (newType === 'Hydration' ? '250ml' : '30 mins')
    };

    setReminders([...reminders, newReminder]);
    setModalVisible(false);
    setNewTitle('');
    setNewTime('');
    setNewType('Medication');
  };

  const renderItem = ({ item }) => (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          opacity: item.completed ? 0.7 : 1
        }
      ]}
      mode="elevated"
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.leftContent}>
          <View style={[styles.iconBox, { backgroundColor: getColorForType(item.type) + '20' }]}>
            <MaterialCommunityIcons
              name={getIconForType(item.type)}
              size={24}
              color={getColorForType(item.type)}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              variant="titleMedium"
              style={[
                styles.title,
                {
                  color: theme.colors.onSurface,
                  textDecorationLine: item.completed ? 'line-through' : 'none'
                }
              ]}
            >
              {item.title}
            </Text>
            <View style={styles.detailsRow}>
              <Chip
                icon="clock-outline"
                style={{ backgroundColor: 'transparent', padding: 0, margin: 0 }}
                textStyle={{ fontSize: 12, color: theme.colors.outline, marginLeft: -4 }}
                compact
              >
                {item.time}
              </Chip>
              {item.dosage && (
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: 8 }}>
                  {item.dosage}
                </Text>
              )}
            </View>
          </View>
        </View>

        <Checkbox
          status={item.completed ? 'checked' : 'unchecked'}
          onPress={() => toggleReminder(item.id)}
          color={theme.colors.primary}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content title="Daily Reminders" titleStyle={{ color: "#fff" }} />
        <Appbar.Action icon="dots-vertical" onPress={() => { }} color="white" />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
            Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
            {reminders.filter(r => r.completed).length}/{reminders.length} Completed
          </Text>
        </View>

        <FlatList
          data={reminders}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => setModalVisible(true)}
      />

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalContent, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <Text variant="headlineSmall" style={{ marginBottom: 16, fontWeight: 'bold', color: theme.colors.onSurface }}>
              New Reminder
            </Text>

            {scanning ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
                <Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Scanning Medicine...</Text>
              </View>
            ) : (
              <>
                <Button
                  mode="outlined"
                  icon="camera"
                  onPress={handleScan}
                  style={{ marginBottom: 16, borderColor: theme.colors.primary }}
                  textColor={theme.colors.primary}
                >
                  Scan Medicine Label
                </Button>

                <TextInput
                  label="Title (e.g., Take Vitamin C)"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  label="Time (e.g., 10:00 AM)"
                  value={newTime}
                  onChangeText={setNewTime}
                  mode="outlined"
                  style={{ marginBottom: 16 }}
                />

                <Text variant="bodyMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>Type</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                  {['Medication', 'Hydration', 'Exercise'].map((type) => (
                    <Chip
                      key={type}
                      selected={newType === type}
                      onPress={() => setNewType(type)}
                      showSelectedOverlay
                    >
                      {type}
                    </Chip>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                  <Button onPress={() => setModalVisible(false)}>Cancel</Button>
                  <Button mode="contained" onPress={addReminder}>Add</Button>
                </View>
              </>
            )}
          </Surface>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 80, // Space for FAB
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
  }
});
