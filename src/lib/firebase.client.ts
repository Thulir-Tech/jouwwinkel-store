
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyChoQYG9z1tWhih1G1KvqGNzEPkb9IG624",
  authDomain: "jouwwinkel.firebaseapp.com",
  projectId: "jouwwinkel",
  storageBucket: "jouwwinkel.appspot.com",
  messagingSenderId: "537625442440",
  appId: "1:537625442440:web:6dae4fc624971b592d073d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Guard for browser environment
// const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, db, auth, storage };
