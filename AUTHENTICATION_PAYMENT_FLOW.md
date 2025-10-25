# Authentication & Payment Flow - Gursha Guide

## 🎯 Complete User Journey

### Phase 1: User Registration & Authentication (FREE ACCESS)
```
1. User visits website → Can browse home page
2. User clicks "Sign Up" → Goes to login.html
3. User creates account with email/password
4. Firebase Authentication creates user
5. User data stored in Firestore 'users' collection:
   {
     uid: "firebase-uid",
     name: "User Name",
     email: "user@example.com",
     subscriptionLevel: "free",  // DEFAULT
     createdAt: "timestamp"
   }
6. User is logged in → Redirected to home page
7. User can now view FREE recipes
```

### Phase 2: Browsing Recipes (FREE vs PREMIUM)
```
1. User browses recipes page
2. Recipes are tagged with subscription level:
   - recipe.subscriptionLevel = "free" → Everyone can view
   - recipe.subscriptionLevel = "gold" → Gold & Platinum only
   - recipe.subscriptionLevel = "platinum" → Platinum only

3. If user tries to view premium recipe:
   - Check: currentUser.subscriptionLevel vs recipe.subscriptionLevel
   - If insufficient → Show "Upgrade to unlock" message
   - Button: "Upgrade to Gold/Platinum"
```

### Phase 3: User Wants Premium (PAYMENT FLOW)
```
1. User clicks "Upgrade" button on locked recipe
   OR
   User goes to subscription.html page

2. User is ALREADY LOGGED IN (Firebase Auth active)

3. User selects plan:
   - Gold Plan: $9.99/month
   - Platinum Plan: $19.99/month

4. User clicks "Subscribe" button

5. System checks: Is user logged in?
   - YES → Continue to payment
   - NO → Redirect to login first

6. Payment form appears with:
   - User email (pre-filled from Firebase Auth)
   - Selected plan (pre-filled)
   - Payment details (Chapa/Stripe)

7. User enters payment info and submits

8. Payment processed through Chapa API

9. On successful payment:
   - Update Firestore 'users' collection:
     {
       uid: "firebase-uid",
       subscriptionLevel: "gold" or "platinum",  // UPDATED
       subscriptionDate: "timestamp",
       paymentId: "chapa-payment-id"
     }
   
10. User immediately gets access to premium recipes

11. UI updates automatically (Firebase auth state listener)
```

### Phase 4: Accessing Premium Content
```
1. User is logged in with premium subscription
2. User browses recipes
3. System checks on EVERY recipe view:
   - Get currentUser from Firebase Auth
   - Get userData from Firestore (includes subscriptionLevel)
   - Compare userData.subscriptionLevel with recipe.subscriptionLevel
   - If authorized → Show full recipe
   - If not authorized → Show upgrade prompt

4. Premium features unlocked:
   - Premium recipes
   - Advanced cooking techniques
   - Video tutorials (if platinum)
   - Downloadable meal plans
```

---

## 🔥 Technical Implementation

### 1. User Authentication State (Already Working)
```javascript
// In main.js - checkAuth() function
authService.onAuthStateChange(async (user) => {
  if (user) {
    // User is logged in
    const userData = await authService.getUserData(user.uid);
    
    // Store in memory (NOT localStorage)
    window.currentUser = {
      uid: user.uid,
      email: user.email,
      name: userData.name,
      subscriptionLevel: userData.subscriptionLevel || 'free'
    };
    
    // Update UI
    updateNavbarForLoggedInUser(userData);
  } else {
    // User is logged out
    window.currentUser = null;
  }
});
```

### 2. Recipe Access Control
```javascript
// Check if user can access recipe
function canAccessRecipe(recipe) {
  const user = window.currentUser;
  
  if (!user) return recipe.subscriptionLevel === 'free';
  
  const levels = {
    'free': 0,
    'gold': 1,
    'platinum': 2
  };
  
  const userLevel = levels[user.subscriptionLevel] || 0;
  const recipeLevel = levels[recipe.subscriptionLevel] || 0;
  
  return userLevel >= recipeLevel;
}

// When displaying recipe
if (canAccessRecipe(recipe)) {
  showFullRecipe(recipe);
} else {
  showUpgradePrompt(recipe.subscriptionLevel);
}
```

### 3. Payment Flow Integration
```javascript
// When user clicks "Subscribe" button
async function handleSubscription(planLevel) {
  // 1. Check if user is logged in
  const user = authService.getCurrentUser();
  
  if (!user) {
    alert('Please login first to subscribe');
    window.location.href = 'login.html';
    return;
  }
  
  // 2. Get user data
  const userData = await authService.getUserData(user.uid);
  
  // 3. Show payment form with pre-filled data
  showPaymentForm({
    userEmail: user.email,
    userName: userData.name,
    subscriptionLevel: planLevel,
    userId: user.uid
  });
}

// After successful payment from Chapa
async function onPaymentSuccess(paymentData) {
  const user = authService.getCurrentUser();
  
  if (!user) {
    console.error('User not logged in during payment!');
    return;
  }
  
  // Update user subscription in Firestore
  await authService.updateSubscription(user.uid, paymentData.subscriptionLevel);
  
  // Update local user object
  window.currentUser.subscriptionLevel = paymentData.subscriptionLevel;
  
  // Show success message
  alert('Subscription activated! You now have access to premium recipes.');
  
  // Redirect to recipes page
  window.location.href = 'recipes.html';
}
```

### 4. Firestore Database Structure
```
users (collection)
  └── {uid} (document - Firebase Auth UID)
      ├── name: "John Doe"
      ├── email: "john@example.com"
      ├── subscriptionLevel: "free" | "gold" | "platinum"
      ├── subscriptionDate: "2025-01-25T10:00:00Z"
      ├── paymentId: "chapa-payment-id"
      └── createdAt: "2025-01-20T10:00:00Z"

recipes (collection)
  └── {recipeId} (document)
      ├── title: "Doro Wat"
      ├── subscriptionLevel: "free" | "gold" | "platinum"
      ├── ingredients: [...]
      ├── instructions: [...]
      └── ...

payments (collection) - Optional for tracking
  └── {paymentId} (document)
      ├── userId: "firebase-uid"
      ├── amount: 9.99
      ├── plan: "gold"
      ├── status: "completed"
      ├── chapaReference: "chapa-ref-123"
      └── timestamp: "2025-01-25T10:00:00Z"
```

---

## 🎨 UI/UX Flow

### Free User Experience
```
✅ Can view: Home, About, Free Recipes
❌ Cannot view: Premium Recipes (shows lock icon + upgrade button)
```

### Gold User Experience
```
✅ Can view: Home, About, Free Recipes, Gold Recipes
❌ Cannot view: Platinum Recipes (shows lock icon + upgrade button)
```

### Platinum User Experience
```
✅ Can view: Everything
```

---

## 🔐 Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Everyone can read recipes
    match /recipes/{recipeId} {
      allow read: if true;
      allow write: if false; // Only admin can write
    }
    
    // Only user can read their own payments
    match /payments/{paymentId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only backend can write
    }
  }
}
```

---

## 📋 Implementation Checklist

### ✅ Already Done:
- [x] Firebase Authentication setup
- [x] User registration with email/password
- [x] User login
- [x] User data stored in Firestore
- [x] Auth state listener

### 🔨 Need to Implement:
- [ ] Remove all localStorage references for user data
- [ ] Update payment flow to use Firebase Auth user
- [ ] Add subscription level checks on recipe pages
- [ ] Update Firestore after successful payment
- [ ] Add visual indicators for locked recipes
- [ ] Add "Upgrade" buttons on locked content
- [ ] Test complete flow: Register → Browse → Pay → Access

---

## 🚀 Next Steps

1. **Update payment-verification.js** to use Firebase Auth instead of localStorage
2. **Update main.js** subscription handlers to use Firebase Auth
3. **Add recipe access control** to recipe display functions
4. **Test the complete flow** from registration to payment to access
