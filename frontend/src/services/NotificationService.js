import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // For now we just get the token, in a real app you'd pass the projectId here if using EAS
        try {
            // Check if we are in Expo Go, where remote notifications might not be supported in newer SDKs
            // We wrap this in a try-catch to prevent crashes

            // Attempt to get token, but don't crash if it fails (common in Expo Go without EAS)
            try {
                // We don't pass projectId explicitly, letting it read from app.json or fail gracefully
                token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log("Push Token:", token);
            } catch (innerError) {
                // Suppress the error log for the user since we know it's an Expo Go limitation
                // console.log("Could not fetch push token (likely Expo Go limitation):", innerError.message);
                // Fallback or just ignore for dev
                token = null;
            }
        } catch (e) {
            // console.log("Error in notification setup:", e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function sendLocalNotification(title, body) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: null, // Send immediately
    });
}
