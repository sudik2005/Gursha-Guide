// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, onSnapshot } from 'firebase/firestore';
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