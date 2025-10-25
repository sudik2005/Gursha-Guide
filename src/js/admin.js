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