// Payment Verification System for Ethiopian Payments (Telebirr/CBE)
import { authService } from '../../firebase-config.js';

// verify.leul.et API Configuration
const VERIFY_API_KEY = 'Y21oNjE2a2VhMDAxeG5vMGs3cjdwNHByai0xNzYxMzgxOTIyODcyLTNnZm80YjR4cDU1';
const VERIFY_CBE_URL = 'https://verify.leul.et/api/verify'; // CBE verification endpoint
const VERIFY_TELEBIRR_URL = 'https://verify.leul.et/api/verify'; // Telebirr verification endpoint

// Account suffix for CBE verification (last 8 digits of your CBE account)
const ACCOUNT_SUFFIX = '01164292'; // Last 8 digits of CBE account: 1000601164292

// Plan pricing configuration
const planPricing = {
  free: {
    name: 'Free Plan',
    price: 0,
    currency: 'ETB'
  },
  gold: {
    name: 'Gold Plan',
    price: 50,
    currency: 'ETB'
  },
  platinum: {
    name: 'Platinum Plan',
    price: 150,
    currency: 'ETB'
  }
};

// Initialize payment modal functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Verify authService is loaded
  if (!authService) {
    console.error('Firebase Auth Service not loaded!');
    return;
  }
  console.log('Payment verification system initialized with Firebase Auth');
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

  // Handle screenshot upload
  initializeScreenshotUpload();
});

// Initialize screenshot upload functionality
function initializeScreenshotUpload() {
  const screenshotInput = document.getElementById('paymentScreenshot');
  const uploadArea = document.getElementById('screenshotUploadArea');
  const preview = document.getElementById('screenshotPreview');
  const previewImg = document.getElementById('screenshotPreviewImg');
  const removeBtn = document.getElementById('removeScreenshot');

  if (!screenshotInput || !uploadArea) return;

  // Click on upload area to trigger file input
  uploadArea.addEventListener('click', () => {
    screenshotInput.click();
  });

  // Handle file selection
  screenshotInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showProfessionalModal({
          type: 'error',
          title: 'Invalid File',
          message: 'Please upload an image file (JPG, PNG, GIF, etc.)',
          buttonText: 'OK'
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showProfessionalModal({
          type: 'error',
          title: 'File Too Large',
          message: 'Screenshot must be less than 5MB. Please compress the image and try again.',
          buttonText: 'OK'
        });
        return;
      }

      // Read and display preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadArea.style.display = 'none';
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Remove screenshot
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      screenshotInput.value = '';
      previewImg.src = '';
      uploadArea.style.display = 'block';
      preview.style.display = 'none';
    });
  }
}

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
  const form = document.getElementById('verificationForm');
  form.reset();
  
  // Reset screenshot preview
  const screenshotInput = document.getElementById('paymentScreenshot');
  const uploadArea = document.getElementById('screenshotUploadArea');
  const preview = document.getElementById('screenshotPreview');
  const previewImg = document.getElementById('screenshotPreviewImg');
  
  if (screenshotInput) screenshotInput.value = '';
  if (previewImg) previewImg.src = '';
  if (uploadArea) uploadArea.style.display = 'block';
  if (preview) preview.style.display = 'none';
  
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
    showProfessionalModal({
      type: 'info',
      title: 'Copy Manually',
      message: 'Failed to copy automatically. Please copy manually: ' + text,
      buttonText: 'OK'
    });
  });
}

// Make copyToClipboard available globally
window.copyToClipboard = copyToClipboard;

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Submit verification
async function submitVerification() {
  const submitBtn = document.getElementById('submitVerification');
  const modal = document.getElementById('paymentModal');
  const selectedPlan = modal.dataset.selectedPlan;
  
  // Get screenshot data if available
  const screenshotInput = document.getElementById('paymentScreenshot');
  let screenshotData = null;
  
  if (screenshotInput && screenshotInput.files && screenshotInput.files[0]) {
    const file = screenshotInput.files[0];
    // Convert to base64 for storage
    screenshotData = await fileToBase64(file);
  }
  
  // Get form data
  const formData = {
    subscriptionLevel: selectedPlan,
    paymentMethod: document.getElementById('paymentMethod').value,
    transactionRef: document.getElementById('transactionRef').value,
    userEmail: document.getElementById('userEmail').value,
    userName: document.getElementById('userName').value,
    amount: planPricing[selectedPlan].price,
    timestamp: new Date().toISOString(),
    screenshot: screenshotData, // Include screenshot data
    screenshotFileName: screenshotInput && screenshotInput.files[0] ? screenshotInput.files[0].name : null
  };
  
  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
  
  try {
    // Store pending verification in localStorage
    const pendingVerifications = JSON.parse(localStorage.getItem('pendingVerifications') || '[]');
    
    // Add verification with screenshot
    const verificationData = {
      ...formData,
      id: Date.now().toString(), // Unique ID
      status: 'pending',
      hasScreenshot: !!screenshotData
    };
    
    pendingVerifications.push(verificationData);
    localStorage.setItem('pendingVerifications', JSON.stringify(pendingVerifications));
    
    // Also log to console for admin review (screenshot data is included)
    console.log('Payment verification submitted:', {
      ...verificationData,
      screenshot: screenshotData ? `[Base64 image data - ${screenshotData.substring(0, 50)}...]` : 'No screenshot'
    });
    
    // In a real implementation, you would:
    // 1. Send this data to your backend
    // 2. Your backend would call verify.leul.et API to verify the transaction
    // 3. If verified, activate the subscription
    
    // Verify payment
    const verificationResult = await simulateVerification(formData);
    
    // If payment was verified and subscription activated, the professional modal
    // will be shown by activateSubscription. Just close the payment modal.
    if (verificationResult && verificationResult.verified) {
      closePaymentModal();
    } else {
      // Payment is pending manual verification
      showMessage('success', 
        'Payment verification submitted successfully! We will verify your payment and activate your subscription within 24 hours. You will receive a confirmation email.'
      );
      
      // Reset form after 3 seconds
      setTimeout(() => {
        closePaymentModal();
      }, 3000);
    }
    
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
        await activateSubscription(formData);
        sendVerificationEmail(formData, true, result);
        return { verified: true, result };
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
async function activateSubscription(formData) {
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) {
    console.error('No user logged in!');
    showProfessionalModal({
      type: 'info',
      title: 'Login Required',
      message: 'Please login first to activate subscription',
      buttonText: 'Go to Login',
      onConfirm: () => {
        window.location.href = 'login.html';
      }
    });
    return;
  }
  
  try {
    // Update user subscription in Firestore
    await authService.updateSubscription(currentUser.uid, formData.subscriptionLevel);
    
    // Update window.currentUser if it exists
    if (window.currentUser) {
      window.currentUser.subscriptionLevel = formData.subscriptionLevel;
    }
    
    console.log('Subscription activated for:', currentUser.email);
    
    // Show success modal
    const planName = formData.subscriptionLevel.charAt(0).toUpperCase() + formData.subscriptionLevel.slice(1);
    showProfessionalModal({
      type: 'success',
      title: 'Subscription Activated!',
      message: `${planName} plan activated successfully! You now have access to premium content.`,
      buttonText: 'Continue',
      onConfirm: () => {
        window.location.reload();
      }
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw error;
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
async function activateFreePlan() {
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) {
    showProfessionalModal({
      type: 'info',
      title: 'Login Required',
      message: 'Please login first to activate the free plan',
      buttonText: 'Go to Login',
      onConfirm: () => {
        window.location.href = 'login.html';
      }
    });
    return;
  }
  
  try {
    // Update user subscription in Firestore
    await authService.updateSubscription(currentUser.uid, 'free');
    
    // Update window.currentUser if it exists
    if (window.currentUser) {
      window.currentUser.subscriptionLevel = 'free';
    }
    
    showProfessionalModal({
      type: 'success',
      title: 'Plan Activated!',
      message: 'Free plan activated successfully! You now have access to free recipes.',
      buttonText: 'Continue',
      onConfirm: () => {
        window.location.reload();
      }
    });
  } catch (error) {
    console.error('Error activating free plan:', error);
    showProfessionalModal({
      type: 'error',
      title: 'Activation Failed',
      message: 'Failed to activate free plan. Please try again or contact support.',
      buttonText: 'OK'
    });
  }
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

// Professional Modal System
function showProfessionalModal(options) {
  const {
    type = 'info', // success, error, info, warning
    title = 'Notification',
    message = '',
    buttonText = 'OK',
    onConfirm = null
  } = options;

  // Remove existing modal if any
  const existingModal = document.getElementById('professionalModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'professionalModal';
  modal.className = 'professional-modal-overlay';
  
  // Icon mapping
  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-exclamation-circle"></i>',
    info: '<i class="fas fa-info-circle"></i>',
    warning: '<i class="fas fa-exclamation-triangle"></i>'
  };

  // Color mapping
  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    info: '#3498db',
    warning: '#f39c12'
  };

  modal.innerHTML = `
    <div class="professional-modal-content">
      <div class="professional-modal-icon" style="color: ${colors[type]}">
        ${icons[type]}
      </div>
      <h2 class="professional-modal-title">${title}</h2>
      <p class="professional-modal-message">${message}</p>
      <button class="professional-modal-button" style="background: ${colors[type]}">
        ${buttonText}
      </button>
    </div>
  `;

  // Add styles if not already added
  if (!document.getElementById('professionalModalStyles')) {
    const style = document.createElement('style');
    style.id = 'professionalModalStyles';
    style.textContent = `
      .professional-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
      }

      .professional-modal-content {
        background: white;
        border-radius: 16px;
        padding: 2.5rem;
        max-width: 420px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
        position: relative;
      }

      .professional-modal-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: scaleIn 0.3s ease-out 0.1s both;
      }

      .professional-modal-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 1rem 0;
        font-family: 'Montserrat', sans-serif;
      }

      .professional-modal-message {
        font-size: 1rem;
        color: #555;
        line-height: 1.6;
        margin: 0 0 1.5rem 0;
      }

      .professional-modal-button {
        padding: 0.75rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Montserrat', sans-serif;
        min-width: 120px;
      }

      .professional-modal-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .professional-modal-button:active {
        transform: translateY(0);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @media (max-width: 768px) {
        .professional-modal-content {
          padding: 2rem 1.5rem;
        }

        .professional-modal-icon {
          font-size: 3rem;
        }

        .professional-modal-title {
          font-size: 1.25rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Add to body
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Handle button click
  const button = modal.querySelector('.professional-modal-button');
  button.addEventListener('click', () => {
    closeProfessionalModal();
    if (onConfirm) {
      onConfirm();
    }
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProfessionalModal();
      if (onConfirm) {
        onConfirm();
      }
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeProfessionalModal();
      if (onConfirm) {
        onConfirm();
      }
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function closeProfessionalModal() {
  const modal = document.getElementById('professionalModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// Make function globally available
window.showProfessionalModal = showProfessionalModal;

// Utility function to view payment verifications (for admin use)
window.viewPaymentVerifications = function() {
  const verifications = JSON.parse(localStorage.getItem('pendingVerifications') || '[]');
  
  if (verifications.length === 0) {
    console.log('No payment verifications found.');
    return;
  }
  
  console.log(`Found ${verifications.length} payment verification(s):\n`);
  
  verifications.forEach((verification, index) => {
    console.log(`\n=== Verification ${index + 1} ===`);
    console.log('Plan:', verification.subscriptionLevel);
    console.log('User:', verification.userName, `(${verification.userEmail})`);
    console.log('Amount:', verification.amount, verification.currency || 'ETB');
    console.log('Payment Method:', verification.paymentMethod);
    console.log('Transaction Reference:', verification.transactionRef);
    console.log('Timestamp:', new Date(verification.timestamp).toLocaleString());
    console.log('Status:', verification.status || 'pending');
    console.log('Has Screenshot:', verification.hasScreenshot ? 'Yes' : 'No');
    
    if (verification.screenshot) {
      console.log('Screenshot available - use viewScreenshot(' + index + ') to view');
    }
  });
  
  // Store verifications globally for screenshot viewing
  window._paymentVerifications = verifications;
};

// Utility function to view a specific screenshot
window.viewScreenshot = function(index) {
  if (!window._paymentVerifications) {
    console.log('Please run viewPaymentVerifications() first');
    return;
  }
  
  const verification = window._paymentVerifications[index];
  if (!verification) {
    console.log('Verification not found at index', index);
    return;
  }
  
  if (!verification.screenshot) {
    console.log('No screenshot available for this verification');
    return;
  }
  
  // Create a modal to view the screenshot
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 10001;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 90%; max-height: 90%; position: relative;">
      <button onclick="this.closest('div').parentElement.remove()" style="position: absolute; top: 1rem; right: 1rem; background: #e74c3c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 1.2rem;">&times;</button>
      <h3 style="margin-bottom: 1rem;">Payment Screenshot - ${verification.userName}</h3>
      <p style="color: #666; margin-bottom: 1rem;">
        Plan: ${verification.subscriptionLevel} | Amount: ${verification.amount} ETB<br>
        Transaction: ${verification.transactionRef}
      </p>
      <img src="${verification.screenshot}" style="max-width: 100%; max-height: 70vh; border-radius: 8px; border: 2px solid #ddd;" alt="Payment screenshot">
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

// Auto-display verifications on page load (for admin convenience)
if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('subscription.html')) {
  // Don't auto-display, but make functions available
  console.log('Payment verification utilities loaded. Use viewPaymentVerifications() to see all payments.');
}
