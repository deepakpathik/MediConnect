import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Avatar, List, Divider, Switch, Portal, Modal, TextInput, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { user, logout, updateUserProfile } = useContext(AuthContext);
    const { theme, toggleTheme, isDark } = useContext(ThemeContext);


    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");


    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [dob, setDob] = useState(user?.dob || "");


    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdateProfile = async () => {
        const result = await updateUserProfile({ name, phone, address, dob });
        if (result.success) {
            setSnackbarMessage("Profile updated successfully");
            setEditModalVisible(false);
        } else {
            setSnackbarMessage(result.error || "Failed to update profile");
        }
        setSnackbarVisible(true);
    };

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            setSnackbarMessage("Passwords do not match");
            setSnackbarVisible(true);
            return;
        }
        // Mock password change
        setSnackbarMessage("Password changed successfully");
        setSnackbarVisible(true);
        setPasswordModalVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <Avatar.Text
                        size={80}
                        label={user?.name?.substring(0, 2).toUpperCase() || "US"}
                        style={{ backgroundColor: theme.colors.primary }}
                    />
                    <Text variant="headlineMedium" style={{ marginTop: 16, fontWeight: 'bold', color: theme.colors.onSurface }}>
                        {user?.name || "User Name"}
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
                        {user?.email || "user@example.com"}
                    </Text>
                    <Button
                        mode="outlined"
                        onPress={() => setEditModalVisible(true)}
                        style={{ marginTop: 16, borderColor: theme.colors.primary }}
                        textColor={theme.colors.primary}
                    >
                        Edit Profile
                    </Button>
                </View>

                <View style={styles.content}>
                    <List.Section>
                        <List.Subheader style={{ color: theme.colors.primary }}>Settings</List.Subheader>

                        <List.Item
                            title="Dark Mode"
                            description="Toggle app theme"
                            left={props => <List.Icon {...props} icon="theme-light-dark" />}
                            right={() => (
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    color={theme.colors.primary}
                                />
                            )}
                        />
                        <Divider />
                        <List.Item
                            title="Notifications"
                            description="Receive app updates"
                            left={props => <List.Icon {...props} icon="bell" />}
                            right={() => (
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    color={theme.colors.primary}
                                />
                            )}
                        />
                    </List.Section>

                    <List.Section>
                        <List.Subheader style={{ color: theme.colors.primary }}>Security</List.Subheader>
                        <List.Item
                            title="Change Password"
                            left={props => <List.Icon {...props} icon="lock-reset" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => setPasswordModalVisible(true)}
                        />
                        <Divider />
                        <List.Item
                            title="Privacy Policy"
                            left={props => <List.Icon {...props} icon="shield-account" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                        />
                    </List.Section>

                    <View style={{ padding: 24, marginTop: 8 }}>
                        <Button
                            mode="contained"
                            onPress={logout}
                            icon="logout"
                            buttonColor={theme.colors.error}
                            style={{ borderRadius: 8 }}
                        >
                            Sign Out
                        </Button>
                        <Text style={{ textAlign: 'center', marginTop: 16, color: theme.colors.outline, fontSize: 12 }}>
                            Version 1.0.0
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <Portal>
                <Modal
                    visible={editModalVisible}
                    onDismiss={() => setEditModalVisible(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
                >
                    <Text variant="headlineSmall" style={styles.modalTitle}>Edit Profile</Text>

                    <TextInput
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="account" />}
                    />
                    <TextInput
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={styles.input}
                        left={<TextInput.Icon icon="phone" />}
                    />
                    <TextInput
                        label="Address"
                        value={address}
                        onChangeText={setAddress}
                        mode="outlined"
                        multiline
                        style={styles.input}
                        left={<TextInput.Icon icon="map-marker" />}
                    />

                    <View style={styles.buttonContainer}>
                        <Button mode="outlined" onPress={() => setEditModalVisible(false)} style={styles.button}>
                            Cancel
                        </Button>
                        <Button mode="contained" onPress={handleUpdateProfile} style={styles.button}>
                            Save
                        </Button>
                    </View>
                </Modal>

                <Modal
                    visible={passwordModalVisible}
                    onDismiss={() => setPasswordModalVisible(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
                >
                    <Text variant="headlineSmall" style={styles.modalTitle}>Change Password</Text>

                    <TextInput
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                    />
                    <TextInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                        left={<TextInput.Icon icon="lock-plus" />}
                    />
                    <TextInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                        left={<TextInput.Icon icon="lock-check" />}
                    />

                    <View style={styles.buttonContainer}>
                        <Button mode="outlined" onPress={() => setPasswordModalVisible(false)} style={styles.button}>
                            Cancel
                        </Button>
                        <Button mode="contained" onPress={handleChangePassword} style={styles.button}>
                            Update
                        </Button>
                    </View>
                </Modal>
            </Portal>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
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
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 12,
    },
    content: {
        flex: 1,
    },
    modal: {
        padding: 24,
        margin: 20,
        borderRadius: 16,
    },
    modalTitle: {
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 12,
    },
    button: {
        flex: 1,
    },
});
