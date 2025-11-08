import { recipeService } from '../../firebase-config.js';

// Global variables
let recipes = [];
let editingRecipe = null;
let uploadedImageUrl = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeForm();
  loadRecipes();
  initializeDarkMode();
  initializePasteFormatting();
  initializePaymentVerifications();
});

// Tab functionality
function initializeTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const contents = document.querySelectorAll('.admin-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Form functionality
function initializeForm() {
  const form = document.getElementById('recipeForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    // Handle image upload
    const imageFile = document.getElementById('recipeImage').files[0];
    let imageUrl = null;
    
    if (imageFile) {
      console.log('Uploading image:', imageFile.name);
      imageUrl = await uploadImage(imageFile);
      console.log('Image uploaded:', imageUrl);
    }

    const recipeData = {
      title: formData.get('title'),
      category: formData.get('category'),
      description: formData.get('description'),
      difficulty: formData.get('difficulty'),
      subscriptionLevel: formData.get('subscriptionLevel'),
      prepTime: formData.get('prepTime'),
      cookTime: formData.get('cookTime'),
      servings: parseInt(formData.get('servings')),
      ingredients: getListItems('ingredientsList'),
      instructions: getListItems('instructionsList'),
      tips: getListItems('tipsList'),
      imageUrl: imageUrl, // Add image URL to recipe data
      createdAt: new Date().toISOString()
    };

    try {
      console.log('Saving recipe data:', recipeData);
      
      if (editingRecipe) {
        console.log('Updating recipe:', editingRecipe.id);
        await recipeService.updateRecipe(editingRecipe.id, recipeData);
        showMessage('Recipe updated successfully!', 'success');
      } else {
        console.log('Adding new recipe...');
        const recipeId = await recipeService.addRecipe(recipeData);
        console.log('Recipe added with ID:', recipeId);
        showMessage('Recipe added successfully!', 'success');
      }
      
      // Reload recipes to show the new/updated recipe
      await loadRecipes();
      
      form.reset();
      clearLists();
      editingRecipe = null;
      document.querySelector('button[type="submit"]').textContent = 'Add Recipe';
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      showMessage('Error saving recipe: ' + error.message, 'error');
    }
  });
}

// Load recipes from Firebase
async function loadRecipes() {
  try {
    console.log('Loading recipes from Firebase...');
    recipes = await recipeService.getRecipes();
    console.log('Recipes loaded:', recipes);
    displayRecipes();
  } catch (error) {
    console.error('Error loading recipes:', error);
    showMessage('Error loading recipes: ' + error.message, 'error');
  }
}

// Display recipes in the manage tab
function displayRecipes() {
  const grid = document.getElementById('recipesGrid');
  
  if (recipes.length === 0) {
    grid.innerHTML = '<p>No recipes found. Add your first recipe!</p>';
    return;
  }

  grid.innerHTML = recipes.map(recipe => `
    <div class="recipe-card">
      <div class="subscription-badge badge-${recipe.subscriptionLevel}">
        ${recipe.subscriptionLevel.toUpperCase()}
      </div>
      ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
      <h3>${recipe.title}</h3>
      <p><strong>Category:</strong> ${recipe.category}</p>
      <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
      <p><strong>Prep:</strong> ${recipe.prepTime} | <strong>Cook:</strong> ${recipe.cookTime}</p>
      <p><strong>Servings:</strong> ${recipe.servings}</p>
      <p>${recipe.description}</p>
      <div class="recipe-actions">
        <button class="btn btn-edit" onclick="editRecipe('${recipe.id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-delete" onclick="deleteRecipe('${recipe.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Edit recipe
window.editRecipe = async function(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  editingRecipe = recipe;
  
  // Fill form with recipe data
  document.getElementById('title').value = recipe.title;
  document.getElementById('category').value = recipe.category;
  document.getElementById('description').value = recipe.description;
  document.getElementById('difficulty').value = recipe.difficulty;
  document.getElementById('subscriptionLevel').value = recipe.subscriptionLevel;
  document.getElementById('prepTime').value = recipe.prepTime;
  document.getElementById('cookTime').value = recipe.cookTime;
  document.getElementById('servings').value = recipe.servings;

  // Fill lists
  fillList('ingredientsList', recipe.ingredients || []);
  fillList('instructionsList', recipe.instructions || []);
  fillList('tipsList', recipe.tips || []);

  // Update submit button
  document.querySelector('button[type="submit"]').textContent = 'Update Recipe';
  
  // Switch to add tab
  document.querySelector('[data-tab="add"]').click();
};

// Delete recipe
window.deleteRecipe = async function(recipeId) {
  if (!confirm('Are you sure you want to delete this recipe?')) return;

  try {
    await recipeService.deleteRecipe(recipeId);
    showMessage('Recipe deleted successfully!', 'success');
    loadRecipes();
  } catch (error) {
    showMessage('Error deleting recipe: ' + error.message, 'error');
  }
};

// Add ingredient
function addIngredient() {
  addListItem('ingredientsList', 'ingredient');
}

// Add instruction
function addInstruction() {
  addListItem('instructionsList', 'instruction');
}

// Add tip
function addTip() {
  addListItem('tipsList', 'tip');
}

// Make functions globally accessible
window.addIngredient = addIngredient;
window.addInstruction = addInstruction;
window.addTip = addTip;
window.previewImage = previewImage;
window.uploadImage = uploadImage;
window.toggleBulkPaste = toggleBulkPaste;
window.processBulkPaste = processBulkPaste;

// Dark Mode Functionality
function initializeDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  if (!darkModeToggle) return;
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Update toggle button icon
  updateDarkModeIcon(currentTheme);
  
  // Add click event listener
  darkModeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    updateDarkModeIcon(newTheme);
    
    console.log('Theme changed to:', newTheme);
  });
}

function updateDarkModeIcon(theme) {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (!darkModeToggle) return;
  
  const icon = darkModeToggle.querySelector('.dark-mode-icon');
  if (icon) {
    if (theme === 'dark') {
      icon.textContent = '☀️';
    } else {
      icon.textContent = '🌙';
    }
  }
}

// Image handling functions
function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('imagePreview');
      const previewImg = document.getElementById('previewImg');
      previewImg.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

async function uploadImage(file) {
  try {
    console.log('Uploading image to Cloudinary:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'gursha_guide');
    formData.append('folder', 'gursha_guide'); // Add folder organization
    
    const response = await fetch('https://api.cloudinary.com/v1_1/dntgrel0s/image/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Image uploaded successfully:', data.secure_url);
    return data.secure_url; // This is your image URL
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Helper function to add list item
function addListItem(listId, type) {
  const list = document.getElementById(listId);
  const li = document.createElement('li');
  
  li.innerHTML = `
    <input type="text" placeholder="Enter ${type}..." style="flex: 1; border: none; background: transparent; padding: 0.5rem; font-size: 1rem;">
    <button type="button" class="remove-item-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Focus on the new input
  const input = li.querySelector('input');
  list.appendChild(li);
  input.focus();
  
  // Add enter key support to add another item
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      addListItem(listId, type);
    }
  });
}

// Helper function to get list items
function getListItems(listId) {
  const list = document.getElementById(listId);
  const inputs = list.querySelectorAll('input');
  return Array.from(inputs).map(input => input.value).filter(value => value.trim() !== '');
}

// Helper function to fill list
function fillList(listId, items) {
  const list = document.getElementById(listId);
  list.innerHTML = '';
  
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="text" value="${item}" style="flex: 1; border: none; background: transparent; padding: 0.5rem; font-size: 1rem;">
      <button type="button" class="remove-item-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    list.appendChild(li);
  });
}

// Helper function to clear lists
function clearLists() {
  ['ingredientsList', 'instructionsList', 'tipsList'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
}

// Show message
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;
  
  if (type === 'success') {
    messageDiv.style.background = 'var(--accent-color)';
  } else {
    messageDiv.style.background = 'var(--accent-color-3)';
  }
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Initialize paste formatting
function initializePasteFormatting() {
  // Add paste event listeners to all list containers
  const lists = ['ingredientsList', 'instructionsList', 'tipsList'];
  
  lists.forEach(listId => {
    const list = document.getElementById(listId);
    if (list) {
      list.addEventListener('paste', (e) => handlePaste(e, listId));
    }
  });
}

// Handle paste event
function handlePaste(e, listId) {
  const pastedText = e.clipboardData.getData('text');
  
  // Check if it's multi-line content
  if (pastedText.includes('\n')) {
    e.preventDefault();
    
    // Split by newlines and clean up
    const lines = pastedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Add each line as a list item
    lines.forEach((line, index) => {
      // Remove existing numbering if present
      const cleanedLine = line.replace(/^\d+\.?\s*/, '');
      
      const list = document.getElementById(listId);
      const li = document.createElement('li');
      
      li.innerHTML = `
        <input type="text" value="${cleanedLine}" style="flex: 1; border: none; background: transparent; padding: 0.5rem; font-size: 1rem;">
        <button type="button" class="remove-item-btn" onclick="this.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      list.appendChild(li);
    });
    
    showMessage(`Added ${lines.length} items`, 'success');
  }
}

// Toggle bulk paste textarea
function toggleBulkPaste(listId) {
  const container = document.getElementById(listId).parentElement;
  let textarea = container.querySelector('.bulk-paste-area');
  
  if (textarea) {
    textarea.remove();
    return;
  }
  
  // Create textarea for bulk paste
  textarea = document.createElement('textarea');
  textarea.className = 'bulk-paste-area';
  textarea.placeholder = 'Paste your items here (one per line)...';
  textarea.style.cssText = `
    width: 100%;
    min-height: 150px;
    padding: 1rem;
    border: 2px dashed var(--accent-color);
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    margin-bottom: 1rem;
    resize: vertical;
  `;
  
  // Create process button
  const processBtn = document.createElement('button');
  processBtn.type = 'button';
  processBtn.className = 'btn btn-primary';
  processBtn.textContent = 'Process & Add Items';
  processBtn.style.marginBottom = '1rem';
  processBtn.onclick = () => processBulkPaste(listId);
  
  // Insert before the list
  const list = document.getElementById(listId);
  list.parentElement.insertBefore(textarea, list);
  list.parentElement.insertBefore(processBtn, list);
  
  textarea.focus();
}

// Process bulk paste
function processBulkPaste(listId) {
  const container = document.getElementById(listId).parentElement;
  const textarea = container.querySelector('.bulk-paste-area');
  
  if (!textarea) return;
  
  const text = textarea.value.trim();
  if (!text) {
    showMessage('Please paste some content first', 'error');
    return;
  }
  
  // Split by newlines and clean up
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Add each line as a list item
  const list = document.getElementById(listId);
  lines.forEach((line) => {
    // Remove existing numbering if present
    const cleanedLine = line.replace(/^\d+\.?\s*/, '');
    
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="text" value="${cleanedLine}" style="flex: 1; border: none; background: transparent; padding: 0.5rem; font-size: 1rem;">
      <button type="button" class="remove-item-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    list.appendChild(li);
  });
  
  showMessage(`Added ${lines.length} items`, 'success');
  
  // Remove textarea and button
  textarea.remove();
  container.querySelector('.btn-primary').remove();
}

// Payment Verifications
let allPayments = [];
let filteredPayments = [];

function initializePaymentVerifications() {
  // Load payments when payments tab is clicked
  const paymentsTab = document.querySelector('[data-tab="payments"]');
  if (paymentsTab) {
    paymentsTab.addEventListener('click', () => {
      loadPaymentVerifications();
    });
  }

  // Setup filters
  const searchInput = document.getElementById('paymentSearch');
  const statusFilter = document.getElementById('paymentStatusFilter');
  const planFilter = document.getElementById('paymentPlanFilter');

  if (searchInput) {
    searchInput.addEventListener('input', filterPayments);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterPayments);
  }
  if (planFilter) {
    planFilter.addEventListener('change', filterPayments);
  }
}

function loadPaymentVerifications() {
  try {
    allPayments = JSON.parse(localStorage.getItem('pendingVerifications') || '[]');
    
    // Sort by date (newest first)
    allPayments.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });

    filteredPayments = [...allPayments];
    updatePaymentStats();
    displayPayments();
  } catch (error) {
    console.error('Error loading payment verifications:', error);
    allPayments = [];
    filteredPayments = [];
    displayPayments();
  }
}

function updatePaymentStats() {
  const total = allPayments.length;
  const pending = allPayments.filter(p => (p.status || 'pending') === 'pending').length;
  const verified = allPayments.filter(p => p.status === 'verified').length;
  const totalAmount = allPayments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const totalPaymentsEl = document.getElementById('totalPayments');
  const pendingPaymentsEl = document.getElementById('pendingPayments');
  const verifiedPaymentsEl = document.getElementById('verifiedPayments');
  const totalAmountEl = document.getElementById('totalAmount');

  if (totalPaymentsEl) totalPaymentsEl.textContent = total;
  if (pendingPaymentsEl) pendingPaymentsEl.textContent = pending;
  if (verifiedPaymentsEl) verifiedPaymentsEl.textContent = verified;
  if (totalAmountEl) totalAmountEl.textContent = `${totalAmount.toFixed(2)} ETB`;
}

function filterPayments() {
  const searchInput = document.getElementById('paymentSearch');
  const statusFilter = document.getElementById('paymentStatusFilter');
  const planFilter = document.getElementById('paymentPlanFilter');

  const searchTerm = (searchInput?.value || '').toLowerCase();
  const statusValue = statusFilter?.value || 'all';
  const planValue = planFilter?.value || 'all';

  filteredPayments = allPayments.filter(payment => {
    const matchesSearch = !searchTerm || 
      (payment.userName && payment.userName.toLowerCase().includes(searchTerm)) ||
      (payment.userEmail && payment.userEmail.toLowerCase().includes(searchTerm)) ||
      (payment.transactionRef && payment.transactionRef.toLowerCase().includes(searchTerm));

    const matchesStatus = statusValue === 'all' || (payment.status || 'pending') === statusValue;
    const matchesPlan = planValue === 'all' || payment.subscriptionLevel === planValue;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  displayPayments();
}

function displayPayments() {
  const tbody = document.getElementById('paymentsTableBody');
  const noPayments = document.getElementById('noPayments');

  if (!tbody) return;

  if (filteredPayments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #999;">
          No payment verifications found.
        </td>
      </tr>
    `;
    if (noPayments) noPayments.style.display = 'block';
    return;
  }

  if (noPayments) noPayments.style.display = 'none';

  tbody.innerHTML = filteredPayments.map((payment, index) => {
    const date = new Date(payment.timestamp);
    const status = payment.status || 'pending';
    const statusClass = `status-${status}`;
    const planName = payment.subscriptionLevel ? 
      payment.subscriptionLevel.charAt(0).toUpperCase() + payment.subscriptionLevel.slice(1) : 'N/A';
    
    return `
      <tr>
        <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
        <td>
          <div class="user-info">
            <div class="user-name">${payment.userName || 'N/A'}</div>
            <div class="user-email">${payment.userEmail || 'N/A'}</div>
          </div>
        </td>
        <td><span class="subscription-badge badge-${payment.subscriptionLevel || 'free'}">${planName}</span></td>
        <td><strong>${payment.amount || 0} ${payment.currency || 'ETB'}</strong></td>
        <td>${payment.paymentMethod ? payment.paymentMethod.toUpperCase() : 'N/A'}</td>
        <td><code>${payment.transactionRef || 'N/A'}</code></td>
        <td><span class="status-badge ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
        <td>
          ${payment.hasScreenshot || payment.screenshot ? 
            `<button class="screenshot-btn" onclick="viewPaymentScreenshot(${index})">
              <i class="fas fa-image"></i> View
            </button>` : 
            '<span style="color: #999;">No screenshot</span>'
          }
        </td>
        <td>
          <div class="action-buttons">
            ${status === 'pending' ? `
              <button class="btn-verify" onclick="verifyPayment(${index})" title="Verify Payment">
                <i class="fas fa-check"></i> Verify
              </button>
              <button class="btn-reject" onclick="rejectPayment(${index})" title="Reject Payment">
                <i class="fas fa-times"></i> Reject
              </button>
            ` : status === 'verified' ? `
              <span style="color: #27ae60;"><i class="fas fa-check-circle"></i> Verified</span>
            ` : `
              <span style="color: #e74c3c;"><i class="fas fa-times-circle"></i> Rejected</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewPaymentScreenshot(index) {
  const payment = filteredPayments[index];
  if (!payment || !payment.screenshot) {
    alert('No screenshot available for this payment');
    return;
  }

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'screenshot-modal';
  modal.innerHTML = `
    <div class="screenshot-modal-content">
      <div class="screenshot-modal-header">
        <div>
          <h3>Payment Screenshot</h3>
          <p style="color: #666; margin-top: 0.5rem;">
            <strong>User:</strong> ${payment.userName} (${payment.userEmail})<br>
            <strong>Plan:</strong> ${payment.subscriptionLevel}<br>
            <strong>Amount:</strong> ${payment.amount} ${payment.currency || 'ETB'}<br>
            <strong>Transaction:</strong> ${payment.transactionRef}<br>
            <strong>Date:</strong> ${new Date(payment.timestamp).toLocaleString()}
          </p>
        </div>
        <button class="screenshot-modal-close" onclick="this.closest('.screenshot-modal').remove()">&times;</button>
      </div>
      <img src="${payment.screenshot}" alt="Payment screenshot">
    </div>
  `;

  document.body.appendChild(modal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

async function verifyPayment(index) {
  const payment = filteredPayments[index];
  if (!payment) return;

  if (!confirm(`Verify payment for ${payment.userName}?\n\nPlan: ${payment.subscriptionLevel}\nAmount: ${payment.amount} ETB\nTransaction: ${payment.transactionRef}`)) {
    return;
  }

  try {
    // Import authService and Firestore to activate subscription
    const { authService, db } = await import('../../firebase-config.js');
    const { collection, query, where, getDocs } = await import('firebase/firestore');

    // Find user by email in Firestore
    let userUid = null;
    if (payment.userEmail) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', payment.userEmail));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          userUid = querySnapshot.docs[0].id;
          console.log('Found user:', userUid);
        }
      } catch (error) {
        console.error('Error finding user:', error);
      }
    }

    // Update payment status
    payment.status = 'verified';
    payment.verifiedAt = new Date().toISOString();
    payment.verifiedBy = 'admin';

    // Try to activate subscription if user was found
    if (userUid) {
      try {
        await authService.updateSubscription(userUid, payment.subscriptionLevel);
        console.log('Subscription activated for user:', userUid);
        
        // Update in localStorage
        updatePaymentInStorage(payment);
        loadPaymentVerifications();
        
        alert('Payment verified and subscription activated successfully!');
      } catch (error) {
        console.error('Error activating subscription:', error);
        // Still mark as verified even if subscription activation fails
        updatePaymentInStorage(payment);
        loadPaymentVerifications();
        alert('Payment verified! Note: Subscription activation failed. Please activate manually in Firebase.');
      }
    } else {
      // User not found, just mark payment as verified
      updatePaymentInStorage(payment);
      loadPaymentVerifications();
      alert('Payment verified! Note: User not found in database. Please activate subscription manually for: ' + payment.userEmail);
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    alert('Error verifying payment: ' + error.message);
  }
}

function rejectPayment(index) {
  const payment = filteredPayments[index];
  if (!payment) return;

  const reason = prompt(`Reject payment for ${payment.userName}?\n\nEnter rejection reason (optional):`);
  
  payment.status = 'rejected';
  payment.rejectedAt = new Date().toISOString();
  payment.rejectionReason = reason || 'No reason provided';
  payment.rejectedBy = 'admin';

  updatePaymentInStorage(payment);
  loadPaymentVerifications();

  alert('Payment rejected.');
}

function updatePaymentInStorage(updatedPayment) {
  const payments = JSON.parse(localStorage.getItem('pendingVerifications') || '[]');
  const index = payments.findIndex(p => p.id === updatedPayment.id || 
    (p.timestamp === updatedPayment.timestamp && p.userEmail === updatedPayment.userEmail));
  
  if (index !== -1) {
    payments[index] = updatedPayment;
  } else {
    // Find by matching properties
    const matchIndex = payments.findIndex(p => 
      p.transactionRef === updatedPayment.transactionRef &&
      p.userEmail === updatedPayment.userEmail
    );
    if (matchIndex !== -1) {
      payments[matchIndex] = updatedPayment;
    }
  }
  
  localStorage.setItem('pendingVerifications', JSON.stringify(payments));
  allPayments = payments;
}

function refreshPayments() {
  loadPaymentVerifications();
}

// Make functions globally available
window.viewPaymentScreenshot = viewPaymentScreenshot;
window.verifyPayment = verifyPayment;
window.rejectPayment = rejectPayment;
window.refreshPayments = refreshPayments;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style); 