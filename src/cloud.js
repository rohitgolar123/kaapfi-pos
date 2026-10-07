// Firebase connection. The POS itself never uses this for billing — it is only for the one-time
// device setup, the nightly report upload, the owner's report view and the customer QR menu.
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy8tI9k7VqskCABCwGMl6OY_PCkuXj80Nxc",
  authDomain: "kaapfi-pos.firebaseapp.com",
  projectId: "kaapfi-pos",
  storageBucket: "kaapfi-pos.firebasestorage.app",
  messagingSenderId: "841260204036",
  appId: "1:841260204036:web:8a614c8b0ff3ac4d81f551",
  measurementId: "G-ZC3CPTHBYG"
};

const app = initializeApp(firebaseConfig);

// The persistent cache is kept so first-time setup can read data the previous (cloud) version saved on this device.
export const cloudDb = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
