# 🔐 Gursha Guide - Authentication & Subscription Flow

## 📋 Complete User Journey

### Phase 1: User Registration & Authentication
```
1. User visits website (not logged in)
   ↓
2. User clicks "Sign Up" in navbar
   ↓
3. User fills registration form (name, email, password)
   ↓
4. Firebase Authentication creates user account
   ↓
5. User data saved to Firestore 'users' collection:
   {
     uid: "firebase-user-id",
     name: "User Name",
     email: "user@example.com",
     subscriptionLevel: "free",  // Default
     subscriptionDate: "2024-01-01",
     createdAt: "2024-01-01"
   }
   ↓
6. User automatically logged in
   ↓
7. Redirect to homepage with "Welcome, [Name]" in navbar
```

### Phase 2: Free Access (Default)
```
User is logged in with FREE account
   ↓
Can view:
   ✅ All free recipes
   ✅ Basic recipe details
   ✅ Homepage content
   ✅ About page
   
Cannot view:
   ❌ Premium recipes (Gold/Platinum only)
   ❌ Advanced cooking techniques
   ❌ Exclusive content
```

### Phase 3: Premium Upgrade Flow
```
1. User browsing recipes
   ↓
2. User clicks on PREMIUM recipe (locked 🔒)
   ↓
3. Modal appears: "This recipe requires Gold/Platinum subscription"
   ↓
4. User clicks "Upgrade Now"
   ↓
5. Redirect to Subscription page (user STILL logged in)
   ↓
6. User selects plan (Gold $9.99 or Platinum $19.99)
   ↓
7. User clicks "Subscribe" button
   ↓
8. Payment form appears (Chapa integration)
   ↓
9. User enters payment details
   ↓
10. Payment processed via Chapa
    ↓
11. Webhook receives payment confirmation
    ↓
12. Backend updates Firestore:
    {
      uid: "firebase-user-id",
      subscriptionLevel: "gold" or "platinum",
      subscriptionDate: "2024-01-01",
      paymentId: "chapa-transaction-id",
      paymentStatus: "completed"
    }
    ↓
13. User automatically gets access to premium content
    ↓
14. Redirect back to recipe page (now unlocked! 🎉)
```

---

## 🗂️ Database Structure

### Firestore Collections:

#### 1. **users** collection
```javascript
{
  uid: "firebase-auth-uid",
  name: "John Doe",
  email: "john@example.com",
  subscriptionLevel: "free" | "gold" | "platinum",
  subscriptionDate: "2024-01-01T00:00:00Z",
  subscriptionExpiry: "2025-01-01T00:00:00Z", // Optional: for monthly billing
  paymentId: "chapa-tx-12345",
  paymentStatus: "completed" | "pending" | "failed",
  createdAt: "2024-01-01T00:00:00Z"
}
```

#### 2. **recipes** collection
```javascript
{
  id: "recipe-123",
  title: "Doro Wat",
  description: "...",
  ingredients: [...],
  instructions: [...],
  subscriptionLevel: "free" | "gold" | "platinum",  // Access level required
  category: "main-course",
  prepTime: "30 min",
  cookTime: "1 hour",
  servings: 4,
  imageUrl: "...",
  createdAt: "2024-01-01T00:00:00Z"
}
```

#### 3. **payments** collection (for tracking)
```javascript
{
  paymentId: "chapa-tx-12345",
  userId: "firebase-auth-uid",
  userEmail: "john@example.com",
  amount: 9.99,
  currency: "ETB",
  subscriptionLevel: "gold",
  status: "completed" | "pending" | "failed",
  chapaReference: "chapa-ref-12345",
  createdAt: "2024-01-01T00:00:00Z"
}
```

---

## 🔒 Access Control Logic

### Recipe Access Check:
```javascript
function canUserAccessRecipe(userSubscriptionLevel, recipeSubscriptionLevel) {
  const levels = {
    'free': 0,
    'gold': 1,
    'platinum': 2
  };
  
  return levels[userSubscriptionLevel] >= levels[recipeSubscriptionLevel];
}

// Example:
// Free user + Free recipe = ✅ Access granted
// Free user + Gold recipe = ❌ Access denied (show upgrade modal)
// Gold user + Gold recipe = ✅ Access granted
// Gold user + Platinum recipe = ❌ Access denied (show upgrade modal)
// Platinum user + Any recipe = ✅ Access granted
```

---

## 🎯 Implementation Steps

### Step 1: Authentication (✅ Already Implemented)
- Firebase Authentication with Email/Password
- User registration saves to Firestore
- Login/Logout functionality
- Auth state listener updates UI

### Step 2: Recipe Access Control (Need to Implement)
- Check user subscription level on recipe page
- Show/hide premium content based on subscription
- Display upgrade modal for locked content

### Step 3: Subscription Page (Need to Update)
- Get current logged-in user
- Display subscription plans
- Handle plan selection
- Integrate Chapa payment

### Step 4: Payment Integration (Need to Implement)
- Integrate Chapa Payment Gateway
- Handle payment success/failure
- Update user subscription in Firestore
- Send confirmation email (optional)

### Step 5: Content Protection (Need to Implement)
- Mark recipes with subscription levels
- Filter recipes based on user access
- Show upgrade prompts for premium content

---

## 🔄 User States

### State 1: Not Logged In
```
Navbar shows: "Sign Up"
Can access: Homepage, About, Free recipes (limited)
Cannot access: Any premium content
Action: Must sign up/login to view full content
```

### State 2: Logged In - Free Account
```
Navbar shows: "Welcome, [Name]" + "Logout"
Can access: All free recipes, basic features
Cannot access: Premium recipes (Gold/Platinum)
Action: Can upgrade to paid plan anytime
```

### State 3: Logged In - Gold Account
```
Navbar shows: "Welcome, [Name]" + "Logout" + "Gold Member 🥇"
Can access: All free + gold recipes
Cannot access: Platinum-only recipes
Action: Can upgrade to Platinum
```

### State 4: Logged In - Platinum Account
```
Navbar shows: "Welcome, [Name]" + "Logout" + "Platinum Member 💎"
Can access: ALL recipes and content
Cannot access: Nothing (full access)
Action: Enjoy all features!
```

---

## 📱 UI Components Needed

### 1. Upgrade Modal (when user clicks locked recipe)
```html
<div class="upgrade-modal">
  <h2>🔒 Premium Recipe</h2>
  <p>This recipe requires a Gold/Platinum subscription</p>
  <button>Upgrade to Gold - $9.99/month</button>
  <button>Upgrade to Platinum - $19.99/month</button>
  <button>Cancel</button>
</div>
```

### 2. Subscription Badge (in navbar)
```html
<span class="subscription-badge gold">Gold Member 🥇</span>
<span class="subscription-badge platinum">Platinum Member 💎</span>
```

### 3. Recipe Lock Indicator
```html
<div class="recipe-card locked">
  <div class="lock-overlay">
    <i class="fas fa-lock"></i>
    <p>Gold Members Only</p>
  </div>
</div>
```

---

## 🚀 Next Implementation Priority

1. ✅ **Authentication** - DONE
2. 🔄 **Recipe Access Control** - NEXT
3. 🔄 **Subscription Payment Flow** - NEXT
4. 🔄 **Chapa Integration** - NEXT
5. 🔄 **Content Protection** - NEXT

---

## 💡 Key Points

- User stays logged in throughout the entire process
- Payment is linked to their Firebase UID
- Subscription level is stored in Firestore
- Real-time updates when subscription changes
- No need to re-login after payment
- All premium content unlocks automatically after payment

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
    
    // Anyone can read recipes
    match /recipes/{recipeId} {
      allow read: if true;
      allow write: if false; // Only admins can write (via backend)
    }
    
    // Only the user can read their own payments
    match /payments/{paymentId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only backend can write
    }
  }
}
```
