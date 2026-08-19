importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyD0dSaW5WWgGFLuUZHJeJBqh3FxjbfV3kk",
  authDomain: "nirogcare-94972.firebaseapp.com",
  projectId: "nirogcare-94972",
  storageBucket: "nirogcare-94972.firebasestorage.app",
  messagingSenderId: "751795986910",
  appId: "1:751795986910:web:75d3b687bf6d1b23257d4f",
  measurementId: "G-5R2HQVB4R7"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "Background message received:",
    payload
  );

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "NirogCare Notification";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new update from NirogCare.",

    icon: "/healthcare.png",

    data: payload.data || {},
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});