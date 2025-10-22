# Firebase Setup Guide for Gursha Guide

## Prerequisites
- A Google account
- Basic knowledge of web development

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `gurshaguide`
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location closest to your users
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In your Firebase project console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "Gursha Guide Web")
6. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

The Firebase configuration is already set up in `firebase-config.js` with the following settings:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBcgg80KhKkj594PhTBxccD2JhaaHs36Uc",
  authDomain: "gurshaguide.firebaseapp.com",
  projectId: "gurshaguide",
  storageBucket: "gurshaguide.firebasestorage.app",
  messagingSenderId: "515979536514",
  appId: "1:515979536514:web:eaca7dc65c01b65b82ac9b",
  measurementId: "G-38FJH227VJ"
};
```

If you created a new Firebase project, replace these values with your own configuration.

## Step 5: Set up Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to recipes for all users
    match /recipes/{recipeId} {
      allow read: if true;
      allow write: if false; // Only allow admin to write via admin panel
    }
  }
}
```

## Step 6: Test the Setup

1. Start your local development server
2. Navigate to `http://localhost:3000/admin.html`
3. Try adding a test recipe
4. Check if it appears in the Firebase console under Firestore Database

## Step 7: Deploy to Production

When ready to deploy:

1. Update Firestore rules to be more secure
2. Set up proper authentication if needed
3. Deploy your website to your hosting provider

## Features Available

### Admin Panel (`/admin.html`)
- **Add Recipes**: Complete form with all recipe details
- **Edit Recipes**: Click edit on any recipe to modify it
- **Delete Recipes**: Remove recipes with confirmation
- **Real-time Updates**: Changes appear immediately

### Recipe Management
- Recipes are stored in Firestore with the following structure:
  ```javascript
  {
    title: "Recipe Name",
    category: "main|vegetarian|bread|beverage|condiment",
    description: "Recipe description",
    difficulty: "Easy|Medium|Hard",
    subscriptionLevel: "free|gold|platinum",
    prepTime: "30 mins",
    cookTime: "1 hr",
    servings: 4,
    ingredients: ["ingredient 1", "ingredient 2"],
    instructions: ["step 1", "step 2"],
    tips: ["tip 1", "tip 2"],
    createdAt: "2024-01-01T00:00:00.000Z"
  }
  ```

### Website Integration
- Recipes are automatically loaded from Firebase
- Fallback to sample recipes if Firebase is unavailable
- Subscription-based access control
- Real-time recipe updates

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Check if Firebase configuration is correct
   - Ensure Firebase SDK is properly loaded

2. **"Permission denied" error**
   - Check Firestore security rules
   - Ensure you're in test mode for development

3. **Recipes not loading**
   - Check browser console for errors
   - Verify Firebase project settings
   - Check network connectivity

### Security Considerations

For production deployment:
1. Set up proper authentication
2. Implement user roles (admin vs regular users)
3. Secure Firestore rules
4. Enable Firebase App Check
5. Set up proper CORS policies

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase project settings
3. Ensure all files are properly loaded
4. Test with a simple recipe first

The admin panel is accessible at `/admin.html` and allows full CRUD operations on recipes stored in Firebase. 