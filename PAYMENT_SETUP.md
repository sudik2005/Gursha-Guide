# Payment Verification Setup Guide

## 🇪🇹 Ethiopian Payment Integration with verify.leul.et

This guide explains how to set up payment verification for Telebirr and CBE Birr payments using the verify.leul.et service.

---

## 📋 Overview

Your Gursha Guide site now supports Ethiopian payment methods:
- **Telebirr** - Mobile money platform
- **CBE Birr** - Commercial Bank of Ethiopia transfers

Users can pay via these methods and submit their transaction reference for verification.

---

## 🎯 How It Works

### User Flow:
1. User clicks on "Get Gold" or "Go Platinum" button
2. Payment modal opens with:
   - Your Telebirr/CBE account details
   - Payment amount
   - Instructions
3. User makes payment via Telebirr or CBE
4. User submits transaction reference number
5. You verify the payment and activate their subscription

### Admin Flow:
1. Receive payment verification request
2. Check transaction using verify.leul.et
3. If valid, manually activate user's subscription
4. Send confirmation email

---

## ⚙️ Setup Instructions

### Step 1: Update Payment Account Details

**A. Edit `subscription.html`** (around line 690-702) and update:

```html
<div class="payment-detail-item">
  <span class="payment-detail-label">Telebirr Number:</span>
  <span class="payment-detail-value">
    YOUR_TELEBIRR_NUMBER
    <button class="copy-btn" onclick="copyToClipboard('YOUR_TELEBIRR_NUMBER')">Copy</button>
  </span>
</div>
<div class="payment-detail-item">
  <span class="payment-detail-label">CBE Bank Account:</span>
  <span class="payment-detail-value">
    YOUR_CBE_ACCOUNT_NUMBER
    <button class="copy-btn" onclick="copyToClipboard('YOUR_CBE_ACCOUNT_NUMBER')">Copy</button>
  </span>
</div>
<div class="payment-detail-item">
  <span class="payment-detail-label">Account Name:</span>
  <span class="payment-detail-value">YOUR_BUSINESS_NAME</span>
</div>
```

**B. Edit `src/js/payment-verification.js`** (line 9) and update:

```javascript
const ACCOUNT_SUFFIX = '12345678'; // Replace with last 8 digits of your CBE account
```

**Note:** This is only needed for CBE verification. Telebirr verification only requires the transaction reference number.

### Step 2: Update Pricing

Edit `src/js/payment-verification.js` (lines 5-20) to set your prices:

```javascript
const planPricing = {
  free: {
    name: 'Free Plan',
    price: 0,
    currency: 'ETB'
  },
  gold: {
    name: 'Gold Plan',
    price: 500,  // Change this to your price
    currency: 'ETB'
  },
  platinum: {
    name: 'Platinum Plan',
    price: 1000,  // Change this to your price
    currency: 'ETB'
  }
};
```

### Step 3: Set Up Backend Verification (Recommended)

For production, you should create a backend API to:

1. **Receive verification requests**
2. **Call verify.leul.et API** to verify transactions
3. **Update user subscriptions** in your database
4. **Send confirmation emails**

Example backend endpoint structure:

```javascript
// POST /api/verify-payment
{
  "subscriptionLevel": "gold",
  "paymentMethod": "telebirr",
  "transactionRef": "TXN123456789",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "amount": 500,
  "timestamp": "2025-10-25T12:00:00.000Z"
}
```

Your backend should then call verify.leul.et:

```javascript
// Example API call to verify.leul.et
const response = await fetch('https://verify.leul.et/api/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY' // If required
  },
  body: JSON.stringify({
    transactionRef: 'TXN123456789',
    paymentMethod: 'telebirr'
  })
});

const result = await response.json();
if (result.verified) {
  // Activate subscription
  // Send confirmation email
}
```

### Step 4: Manual Verification (For Now)

Until you set up the backend:

1. Users submit their transaction reference
2. Data is stored in browser's localStorage
3. You can view pending verifications in browser console:
   ```javascript
   JSON.parse(localStorage.getItem('pendingVerifications'))
   ```
4. Manually verify each transaction on verify.leul.et
5. Manually activate subscriptions

---

## 🔧 Testing

### Test the Payment Flow:

1. Go to subscription page
2. Click "Get Gold" or "Go Platinum"
3. Modal should open with payment details
4. Fill in the verification form:
   - Select payment method
   - Enter any test transaction reference
   - Enter email and name
5. Click "Submit for Verification"
6. Should see success message

### Check Pending Verifications:

Open browser console and run:
```javascript
JSON.parse(localStorage.getItem('pendingVerifications'))
```

---

## 📱 Using verify.leul.et

### Manual Verification:

1. Go to https://verify.leul.et/
2. Enter the transaction reference number
3. Or upload the payment receipt screenshot
4. System will verify if payment is legitimate

### API Integration (Future):

Check verify.leul.et documentation for API access:
- May require registration
- May have rate limits
- Check for API keys or authentication requirements

---

## 💡 Next Steps

### Immediate:
1. ✅ Update your Telebirr/CBE account number
2. ✅ Update pricing if needed
3. ✅ Test the payment flow
4. ✅ Set up email notifications

### Future Improvements:
1. 🔄 Create backend API for automatic verification
2. 🔄 Integrate with verify.leul.et API
3. 🔄 Add database to store subscriptions
4. 🔄 Implement automated email confirmations
5. 🔄 Add subscription management dashboard
6. 🔄 Add payment history for users

---

## 🌍 International Payments

For international customers, consider adding:
- **Stripe** - For credit cards worldwide
- **PayPal** - For global payments
- **Paystack** - For African markets

You can add these alongside the Ethiopian payment methods.

---

## 📞 Support

If users have payment issues:
1. Check transaction on verify.leul.et
2. Verify payment amount matches subscription price
3. Confirm transaction reference is correct
4. Check payment method (Telebirr vs CBE)
5. Contact user via email for clarification

---

## 🔒 Security Notes

1. **Never store sensitive payment data** in localStorage
2. **Always verify transactions** before activating subscriptions
3. **Use HTTPS** in production
4. **Implement rate limiting** to prevent abuse
5. **Log all verification attempts** for audit trail
6. **Send confirmation emails** for all transactions

---

## 📝 Customization

### Change Modal Styling:

Edit `subscription.html` CSS section (lines 54-261) to customize:
- Colors
- Fonts
- Layout
- Animations

### Add More Payment Methods:

Edit the payment method dropdown in `subscription.html`:
```html
<select id="paymentMethod" name="paymentMethod" required>
  <option value="">Select payment method</option>
  <option value="telebirr">Telebirr</option>
  <option value="cbe">CBE Birr</option>
  <option value="other">Other</option> <!-- Add more -->
</select>
```

---

## ✅ Checklist

Before going live:
- [ ] Updated Telebirr/CBE account number
- [ ] Updated pricing
- [ ] Tested payment flow
- [ ] Set up email notifications
- [ ] Created backend API (recommended)
- [ ] Tested verify.leul.et integration
- [ ] Added terms and conditions
- [ ] Set up customer support email
- [ ] Documented verification process
- [ ] Trained team on manual verification

---

**Need help?** Check the verify.leul.et documentation or contact their support for API access.
