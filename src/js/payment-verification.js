// Payment Verification System for Ethiopian Payments (Telebirr/CBE)

// verify.leul.et API Configuration
const VERIFY_API_KEY = 'Y21oNjE2a2VhMDAxeG5vMGs3cjdwNHByai0xNzYxMzgxOTIyODcyLTNnZm80YjR4cDU1';
const VERIFY_CBE_URL = 'https://verify.leul.et/api/verify'; // CBE verification endpoint
const VERIFY_TELEBIRR_URL = 'https://verify.leul.et/api/verify'; // Telebirr verification endpoint

// Account suffix for CBE verification (last 8 digits of your CBE account)
const ACCOUNT_SUFFIX = '12345678'; // Replace with your actual CBE account suffix

// Plan pricing configuration
const planPricing = {
  free: {
    name: 'Free Plan',
    price: 0,
    currency: 'ETB'
  },
  gold: {
    name: 'Gold Plan',
    price: 500,
    currency: 'ETB'
  },
  platinum: {
    name: 'Platinum Plan',
    price: 1000,
    currency: 'ETB'
  }
};

// Initialize payment modal functionality
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('paymentModal');
  const closeBtn = document.getElementById('closeModal');
  const subscriptionButtons = document.querySelectorAll('.subscription-form');
  const verificationForm = document.getElementById('verificationForm');

  // Open modal when subscription button is clicked
  subscriptionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const subscriptionLevel = button.dataset.subscriptionLevel;
      
      // Don't show modal for free plan
      if (subscriptionLevel === 'free') {
        activateFreePlan();
        return;
      }
      
      openPaymentModal(subscriptionLevel);
    });
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    closePaymentModal();
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePaymentModal();
    }
  });

  // Handle verification form submission
  verificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitVerification();
  });
});

// Open payment modal with plan details
function openPaymentModal(subscriptionLevel) {
  const modal = document.getElementById('paymentModal');
  const plan = planPricing[subscriptionLevel];
  
  if (!plan) return;
  
  // Update modal content
  document.getElementById('modalPlanName').textContent = plan.name;
  document.getElementById('modalPrice').textContent = `${plan.price} ${plan.currency}/month`;
  document.getElementById('modalAmount').textContent = `${plan.price} ${plan.currency}`;
  
  // Store selected plan in modal
  modal.dataset.selectedPlan = subscriptionLevel;
  
  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close payment modal
function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset form
  document.getElementById('verificationForm').reset();
  hideMessage();
}

// Copy to clipboard functionality
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show temporary success message
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = '#27ae60';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy. Please copy manually: ' + text);
  });
}

// Make copyToClipboard available globally
window.copyToClipboard = copyToClipboard;

// Submit verification
async function submitVerification() {
  const submitBtn = document.getElementById('submitVerification');
  const modal = document.getElementById('paymentModal');
  const selectedPlan = modal.dataset.selectedPlan;
  
  // Get form data
  const formData = {
    subscriptionLevel: selectedPlan,
    paymentMethod: document.getElementById('paymentMethod').value,
    transactionRef: document.getElementById('transactionRef').value,
    userEmail: document.getElementById('userEmail').value,
    userName: document.getElementById('userName').value,
    amount: planPricing[selectedPlan].price,
    timestamp: new Date().toISOString()
  };
  
  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
  
  try {
    // Store pending verification in localStorage
    const pendingVerifications = JSON.parse(localStorage.getItem('pendingVerifications') || '[]');
    pendingVerifications.push(formData);
    localStorage.setItem('pendingVerifications', JSON.stringify(pendingVerifications));
    
    // In a real implementation, you would:
    // 1. Send this data to your backend
    // 2. Your backend would call verify.leul.et API to verify the transaction
    // 3. If verified, activate the subscription
    
    // For now, simulate success
    await simulateVerification(formData);
    
    showMessage('success', 
      'Payment verification submitted successfully! We will verify your payment and activate your subscription within 24 hours. You will receive a confirmation email.'
    );
    
    // Reset form after 3 seconds
    setTimeout(() => {
      closePaymentModal();
    }, 3000);
    
  } catch (error) {
    console.error('Verification error:', error);
    showMessage('error', 
      'Failed to submit verification. Please try again or contact support.'
    );
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit for Verification';
  }
}

// Verify payment with verify.leul.et API
async function simulateVerification(formData) {
  try {
    const isTelebirr = formData.paymentMethod === 'telebirr';
    const apiUrl = isTelebirr ? VERIFY_TELEBIRR_URL : VERIFY_CBE_URL;
    
    // Prepare request body based on payment method
    const requestBody = isTelebirr 
      ? { reference: formData.transactionRef }
      : { reference: formData.transactionRef, accountSuffix: ACCOUNT_SUFFIX };
    
    console.log(`Verifying ${isTelebirr ? 'Telebirr' : 'CBE'} payment...`);
    console.log('Request:', requestBody);
    
    // Call verify.leul.et API to verify the transaction
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': VERIFY_API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Verification API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('Verification result:', result);
    
    // Check if payment is verified successfully
    if (result.success === true) {
      let receivedAmount;
      
      // Parse amount based on payment method
      if (isTelebirr && result.data) {
        // Telebirr format: "101.00 Birr"
        receivedAmount = parseFloat(result.data.totalPaidAmount.replace(/[^0-9.]/g, ''));
      } else if (!isTelebirr && result.amount) {
        // CBE format: "3,000.00 ETB"
        receivedAmount = parseFloat(result.amount.replace(/[^0-9.]/g, ''));
      } else {
        throw new Error('Unable to parse payment amount from response');
      }
      
      const expectedAmount = formData.amount;
      
      if (receivedAmount >= expectedAmount) {
        console.log('Payment verified successfully!');
        console.log(`Amount: ${receivedAmount} ETB (Expected: ${expectedAmount} ETB)`);
        activateSubscription(formData);
        sendVerificationEmail(formData, true, result);
        return result;
      } else {
        throw new Error(`Amount mismatch: Expected ${expectedAmount} ETB, got ${receivedAmount} ETB`);
      }
    } else {
      throw new Error('Payment verification failed - transaction not found or invalid');
    }
    
  } catch (error) {
    console.error('Verification API error:', error);
    
    // Fallback: Store for manual verification
    console.log('Payment verification data (manual review needed):', formData);
    sendVerificationEmail(formData, false);
    
    // Don't throw error - let manual verification happen
    return { verified: false, manual: true, error: error.message };
  }
}

// Activate user subscription after successful verification
function activateSubscription(formData) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (currentUser && currentUser.email === formData.userEmail) {
    // Update user subscription
    currentUser.subscriptionLevel = formData.subscriptionLevel;
    currentUser.subscriptionDate = new Date().toISOString();
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex].subscriptionLevel = formData.subscriptionLevel;
      users[userIndex].subscriptionDate = new Date().toISOString();
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    console.log('Subscription activated for:', formData.userEmail);
  }
}

// Send verification email (placeholder)
function sendVerificationEmail(formData, isVerified = false, apiResult = null) {
  console.log('Sending verification email to:', formData.userEmail);
  console.log('Transaction details:', formData);
  console.log('Verification status:', isVerified ? 'VERIFIED' : 'PENDING MANUAL REVIEW');
  
  if (apiResult && isVerified) {
    console.log('Payment details from API:', apiResult);
    if (apiResult.data) {
      // Telebirr details
      console.log('Payer:', apiResult.data.payerName);
      console.log('Amount:', apiResult.data.totalPaidAmount);
      console.log('Date:', apiResult.data.paymentDate);
    } else if (apiResult.payer) {
      // CBE details
      console.log('Payer:', apiResult.payer);
      console.log('Amount:', apiResult.amount);
      console.log('Date:', apiResult.date);
    }
  }
  
  // In production, your backend would:
  // 1. Receive this data
  // 2. Call verify.leul.et API to verify the transaction
  // 3. Send confirmation email to user with payment details
  // 4. Activate subscription if verified
}

// Activate free plan
function activateFreePlan() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    alert('Please login first to activate the free plan');
    window.location.href = 'login.html';
    return;
  }
  
  // Update user subscription
  currentUser.subscriptionLevel = 'free';
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Update users array
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex].subscriptionLevel = 'free';
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  alert('Free plan activated successfully!');
  window.location.reload();
}

// Show message
function showMessage(type, message) {
  const messageEl = document.getElementById('verificationMessage');
  messageEl.textContent = message;
  messageEl.className = `verification-message ${type}`;
  messageEl.style.display = 'block';
}

// Hide message
function hideMessage() {
  const messageEl = document.getElementById('verificationMessage');
  messageEl.style.display = 'none';
  messageEl.className = 'verification-message';
}
