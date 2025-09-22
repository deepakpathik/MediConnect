import React, { useState, useContext } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Modal, Portal, TextInput, Button, Text } from "react-native-paper";
import { ThemeContext } from "../context/ThemeContext";

export default function AddDoctorModal({ visible, onDismiss, onAdd }) {
  const { theme } = useContext(ThemeContext);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleAdd = () => {
    if (name.trim() && specialty.trim()) {
      onAdd({
        name: name.trim(),
        specialty: specialty.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });
      setName("");
      setSpecialty("");
      setPhone("");
      setEmail("");
      setAddress("");
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            Add New Doctor
          </Text>

          <TextInput
            label="Doctor Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Specialty *"
            value={specialty}
            onChangeText={setSpecialty}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAdd}
              style={styles.button}
              disabled={!name.trim() || !specialty.trim()}
            >
              Add Doctor
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: "80%",
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
