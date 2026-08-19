import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const vapidKey = import.meta.env.VITE_VAPID_KEY;

console.log("Firebase project:", firebaseConfig.projectId);
console.log("VAPID key exists:", !!vapidKey);
console.log("VAPID key length:", vapidKey?.length);

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async () => {
  try {
    if (!("Notification" in window)) {
      console.warn("Notifications are not supported.");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    console.log(
      "Service worker registered:",
      registration
    );

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    console.log("FCM Token:", token);

    if (!token) {
      console.warn("FCM token is null");
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log("Foreground Message:", payload);

    if (callback) {
      callback(payload);
    }
  });
};