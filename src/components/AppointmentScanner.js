import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AppointmentScanner({ onScanComplete, theme }) {
  const [scanning, setScanning] = useState(false);
  const [image, setImage] = useState(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to scan appointments.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const extractAppointmentData = (text) => {
    // Simple extraction logic - can be enhanced
    const lines = text.split('\n').filter(line => line.trim());
    
    let date = '';
    let time = '';
    let doctorName = '';
    let notes = '';

    // Look for date patterns (DD/MM/YYYY, DD-MM-YYYY, etc.)
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      date = dateMatch[1];
    }

    // Look for time patterns (HH:MM AM/PM, HH:MM)
    const timePattern = /(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)/;
    const timeMatch = text.match(timePattern);
    if (timeMatch) {
      time = timeMatch[1];
    }

    // Look for doctor name (usually starts with Dr.)
    const doctorPattern = /(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i;
    const doctorMatch = text.match(doctorPattern);
    if (doctorMatch) {
      doctorName = doctorMatch[0];
    }

    // Use remaining text as notes
    notes = lines.slice(0, 3).join(' ');

    return { date, time, doctorName, notes };
  };

  const processImageWithOCR = async (imageUri) => {
    try {
      setScanning(true);

      // Use Google Cloud Vision API for OCR
      const apiKey = 'YOUR_GOOGLE_CLOUD_VISION_API_KEY'; // You'll need to add this
      
      // For now, we'll use a mock OCR response
      // In production, you should use Google Cloud Vision API or Tesseract.js
      
      // Mock extracted text (replace with actual OCR)
      const mockExtractedText = `
        Appointment Confirmation
        Dr. Sarah Johnson
        Date: 15/10/2025
        Time: 10:30 AM
        Location: City Medical Center
        Please arrive 15 minutes early
      `;

      const appointmentData = extractAppointmentData(mockExtractedText);
      
      setScanning(false);
      onScanComplete(appointmentData);
      
      Alert.alert(
        'Scan Complete',
        'Appointment details extracted successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('OCR Error:', error);
      setScanning(false);
      Alert.alert(
        'Scan Failed',
        'Could not extract text from image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await processImageWithOCR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera Error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await processImageWithOCR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="camera-plus" size={32} color={theme.colors.primary} />
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]}>
            Scan Appointment
          </Text>
        </View>

        <Text variant="bodySmall" style={[styles.description, { color: theme.colors.text }]}>
          Take a photo or select an image of your appointment card to automatically extract details
        </Text>

        {image && (
          <Image source={{ uri: image }} style={styles.preview} />
        )}

        {scanning ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, marginTop: 12 }}>
              Extracting appointment details...
            </Text>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={takePhoto}
              icon="camera"
              style={styles.button}
            >
              Take Photo
            </Button>
            <Button
              mode="outlined"
              onPress={pickImage}
              icon="image"
              style={styles.button}
            >
              Choose Image
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(98, 0, 238, 0.3)',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
});
