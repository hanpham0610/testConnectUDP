import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyCOqgTdUdjHADA_SKXB-r2nHMCxZ-yUsgk",
  authDomain: "testconnect-31878.firebaseapp.com",
  databaseURL: "https://testconnect-31878-default-rtdb.firebaseio.com",
  projectId: "testconnect-31878",
  storageBucket: "testconnect-31878.appspot.com",
  messagingSenderId: "972849392374",
  appId: "1:972849392374:web:7ceeff206ca7f01ad0dad7",
  measurementId: "G-5EL6TDLC3L"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set };