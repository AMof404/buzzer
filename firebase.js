// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, get, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAprsLGm4_FPOl_2lCrnxHW96zzqWuSgME",
    authDomain: "buzzer-ad02c.firebaseapp.com",
    databaseURL: "https://buzzer-ad02c-default-rtdb.firebaseio.com",
    projectId: "buzzer-ad02c",
    storageBucket: "buzzer-ad02c.firebasestorage.app",
    messagingSenderId: "188278957261",
    appId: "1:188278957261:web:e388a4a0916c593ead3584",
    measurementId: "G-4PG8TDYY3P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, onValue, runTransaction };
