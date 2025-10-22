import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBcgg80KhKkj594PhTBxccD2JhaaHs36Uc",
  authDomain: "gurshaguide.firebaseapp.com",
  projectId: "gurshaguide",
  storageBucket: "gurshaguide.firebasestorage.app",
  messagingSenderId: "515979536514",
  appId: "1:515979536514:web:eaca7dc65c01b65b82ac9b",
  measurementId: "G-38FJH227VJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 