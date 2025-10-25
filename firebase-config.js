// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcgg80KhKkj594PhTBxccD2JhaaHs36Uc",
  authDomain: "gurshaguide.firebaseapp.com",
  projectId: "gurshaguide",
  storageBucket: "gurshaguide.firebasestorage.app",
  messagingSenderId: "515979536514",
  appId: "1:515979536514:web:eaca7dc65c01b65b82ac9b",
  measurementId: "G-38FJH227VJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (with error handling for environments where it might not work)
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics initialization failed:', error);
  analytics = null;
}

const db = getFirestore(app);
const auth = getAuth(app);

// Authentication service
export const authService = {
  // Register new user
  async register(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        subscriptionLevel: 'free',
        createdAt: new Date().toISOString()
      });
      
      console.log('User registered successfully:', user.uid);
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Update user subscription
  async updateSubscription(uid, subscriptionLevel) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        subscriptionLevel: subscriptionLevel,
        subscriptionDate: new Date().toISOString()
      });
      console.log('Subscription updated successfully');
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
};

// Recipe management functions
export const recipeService = {
  // Get all recipes
  async getRecipes() {
    try {
      const querySnapshot = await getDocs(collection(db, 'recipes'));
      const recipes = [];
      querySnapshot.forEach((doc) => {
        recipes.push({ id: doc.id, ...doc.data() });
      });
      return recipes;
    } catch (error) {
      console.error('Error getting recipes:', error);
      return [];
    }
  },

  // Add new recipe
  async addRecipe(recipeData) {
    try {
      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('Recipe added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  },

  // Update recipe
  async updateRecipe(recipeId, recipeData) {
    try {
      const recipeRef = doc(db, 'recipes', recipeId);
      await updateDoc(recipeRef, recipeData);
      console.log('Recipe updated successfully');
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  // Delete recipe
  async deleteRecipe(recipeId) {
    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
      console.log('Recipe deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  // Listen for real-time updates
  onRecipesUpdate(callback) {
    return onSnapshot(collection(db, 'recipes'), (snapshot) => {
      const recipes = [];
      snapshot.forEach((doc) => {
        recipes.push({ id: doc.id, ...doc.data() });
      });
      callback(recipes);
    });
  }
};

export { db }; 