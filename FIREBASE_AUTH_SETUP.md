# Firebase Authentication Setup Guide

## ⚠️ IMPORTANT: Enable Firebase Authentication

Your Firebase Authentication is now implemented in the code, but you MUST enable it in the Firebase Console first.

### Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **gurshaguide**
3. Click on **Authentication** in the left sidebar
4. Click on **Get Started** (if you haven't set up Authentication yet)
5. Go to **Sign-in method** tab
6. Click on **Email/Password**
7. Toggle **Enable** to ON
8. Click **Save**

### Step 2: Verify Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Make sure you have a database created
3. Check that the rules allow authenticated users to read/write

### Step 3: Test Authentication

1. Open your website
2. Go to the Sign Up page (login.html)
3. Open browser console (F12)
4. Try to register a new user
5. Check the console for any error messages

### Common Errors:

#### Error: "auth/operation-not-allowed"
- **Solution**: Email/Password authentication is not enabled in Firebase Console
- Follow Step 1 above

#### Error: "Firebase: Error (auth/invalid-api-key)"
- **Solution**: Check your API key in firebase-config.js

#### Error: "Failed to load Firebase auth"
- **Solution**: Make sure firebase is installed: `npm install firebase`

### Debugging:

Open browser console (F12) and look for these messages:
- "Attempting to register user: [email]"
- "User registered successfully: [user object]"
- Any error messages with error codes

### Verify Users are Saved:

1. Go to Firebase Console
2. Click **Authentication** → **Users** tab
3. You should see registered users listed here
4. Go to **Firestore Database**
5. Check the **users** collection for user data

## Current Implementation:

✅ Firebase Authentication SDK imported
✅ Register function creates user in Firebase Auth
✅ User data saved to Firestore 'users' collection
✅ Login function uses Firebase Auth
✅ Logout function signs out from Firebase
✅ Auth state listener updates UI automatically

## Next Steps:

1. Enable Email/Password auth in Firebase Console
2. Test registration with browser console open
3. Check Firebase Console for new users
4. Test login with registered user
5. Verify user data in Firestore
