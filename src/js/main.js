// Enhanced DOM Elements Selection with modern features
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Gursha Guide initializing...');
  
  // Initialize all components
  initializeMobileMenu();
  initializeAuthentication();
  initializeRecipeFiltering();
  initializeSubscriptionHandling();
  initializeInfoToggles();
  initializeScrollAnimations();
  initializeLazyLoading();
  initializeSmoothScrolling();
  initializeDarkMode();
  initializeSlidingAuthForm();
  
  // Check authentication on load (await it!)
  console.log('Checking authentication...');
  await checkAuth();
  console.log('Authentication check complete');
  
  // Load recipes from Firebase
  console.log('Loading recipes from Firebase...');
  await loadRecipesFromFirebase();
  console.log('Recipes loaded:', recipes.length);
});

// Enhanced Mobile Menu with smooth animations
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const header = document.querySelector('.header');

  // Helper: check if mobile menu is active (menu toggle is visible)
  function isMobileMenu() {
    return window.getComputedStyle(menuToggle).display !== 'none';
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
      // Add smooth animation
      if (navLinks.classList.contains('active')) {
        navLinks.style.transform = 'translateY(0)';
        navLinks.style.opacity = '1';
        navLinks.style.visibility = 'visible';
      } else {
        navLinks.style.transform = 'translateY(-100%)';
        navLinks.style.opacity = '0';
        navLinks.style.visibility = 'hidden';
      }
    });

    // Close menu when clicking a nav link (only on mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (isMobileMenu()) {
          navLinks.classList.remove('active');
          menuToggle.innerHTML = '☰';
          navLinks.style.transform = 'translateY(-100%)';
          navLinks.style.opacity = '0';
          navLinks.style.visibility = 'hidden';
        }
      });
    });

    // Close menu when clicking outside (only on mobile)
    document.addEventListener('click', (e) => {
      if (isMobileMenu() && !menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        menuToggle.innerHTML = '☰';
        navLinks.style.transform = 'translateY(-100%)';
        navLinks.style.opacity = '0';
        navLinks.style.visibility = 'hidden';
      }
    });
  }

  // Header scroll effect
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
      }
    });
  }
}

// Helper functions for user feedback
function showErrorMessage(message, formElement = null) {
  // Try to find message element in the form or nearby
  let messageEl = null;
  if (formElement) {
    messageEl = formElement.querySelector('.auth-message');
  }
  if (!messageEl) {
    messageEl = document.querySelector('.auth-message');
  }
  
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = 'auth-message error';
    messageEl.style.display = 'block';
    // Scroll to message if needed
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  } else {
    // Fallback to alert
    alert(message);
  }
}

function showSuccessMessage(message, formElement = null) {
  // Try to find message element in the form or nearby
  let messageEl = null;
  if (formElement) {
    messageEl = formElement.querySelector('.auth-message');
  }
  if (!messageEl) {
    messageEl = document.querySelector('.auth-message');
  }
  
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = 'auth-message success';
    messageEl.style.display = 'block';
    // Scroll to message if needed
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  } else {
    // Fallback to alert
    alert(message);
  }
}

// Enhanced Authentication with Firebase
async function initializeAuthentication() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  console.log('Authentication initialization:', {
    loginForm: !!loginForm,
    registerForm: !!registerForm,
    currentPage: window.location.pathname
  });

  // Import Firebase auth service
  let authService;
  try {
    console.log('Loading Firebase auth service...');
    // Try relative path first, fallback to absolute
    let firebaseModule;
    try {
      firebaseModule = await import('../../firebase-config.js');
    } catch (e) {
      try {
        firebaseModule = await import('/firebase-config.js');
      } catch (e2) {
        throw new Error(`Failed to import Firebase config: ${e.message}. Also tried: ${e2.message}`);
      }
    }
    console.log('Firebase module loaded:', firebaseModule);
    authService = firebaseModule.authService;
    console.log('Auth service:', authService);
    
    if (!authService) {
      console.error('Auth service is undefined!');
      alert('Firebase Authentication is not properly configured. Please check the console.');
      return;
    }
  } catch (error) {
    console.error('Failed to load Firebase auth:', error);
    console.error('Error details:', error.stack);
    alert('Failed to load authentication system: ' + error.message + '\n\nPlease check:\n1. Firebase is properly configured\n2. You are connected to the internet\n3. Check browser console for details');
    return;
  }

  // Enhanced login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Show loading state
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;

      const emailInput = loginForm.querySelector('input[name="email"]') || loginForm.querySelector('input[type="email"]');
      const passwordInput = loginForm.querySelector('input[name="password"]') || loginForm.querySelector('input[type="password"]');

      if (!emailInput || !passwordInput) {
        showErrorMessage('Please fill in all required fields', loginForm);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      try {
        console.log('Attempting to login user:', email);
        const user = await authService.login(email, password);
        console.log('User logged in successfully:', user);
        showSuccessMessage('Login successful! Redirecting...', loginForm);
        
        // Add success animation
        loginForm.style.transform = 'scale(0.95)';
        setTimeout(() => {
          loginForm.style.transform = 'scale(1)';
        }, 150);

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } catch (error) {
        console.error('Login error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Invalid email or password: ' + error.message;
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid email or password';
        }
        
        showErrorMessage(errorMessage, loginForm);
        loginForm.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          loginForm.style.animation = '';
        }, 500);
      }

      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }

  // Enhanced registration form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Show loading state
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;

      // Get form values - handle both login.html (sliding form) and register.html
      const nameInput = registerForm.querySelector('input[name="name"]') || registerForm.querySelector('#name');
      const emailInput = registerForm.querySelector('input[name="email"]') || registerForm.querySelector('#email');
      const passwordInput = registerForm.querySelector('input[name="password"]') || registerForm.querySelector('#password');
      const confirmPasswordInput = registerForm.querySelector('input[name="confirm-password"]') || registerForm.querySelector('#confirm-password');

      if (!nameInput || !emailInput || !passwordInput) {
        showErrorMessage('Please fill in all required fields', registerForm);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : null;

      // Validate password confirmation if field exists
      if (confirmPasswordInput && password !== confirmPassword) {
        showErrorMessage('Passwords do not match', registerForm);
        registerForm.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          registerForm.style.animation = '';
        }, 500);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      // Validate password strength
      if (password.length < 6) {
        showErrorMessage('Password must be at least 6 characters long', registerForm);
        registerForm.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          registerForm.style.animation = '';
        }, 500);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      try {
        console.log('Attempting to register user:', email);
        const user = await authService.register(email, password, name);
        console.log('User registered successfully:', user);
        showSuccessMessage('Registration successful! Redirecting...', registerForm);
        
        // Add success animation
        registerForm.style.transform = 'scale(0.95)';
        setTimeout(() => {
          registerForm.style.transform = 'scale(1)';
        }, 150);

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } catch (error) {
        console.error('Registration error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Registration failed: ' + error.message;
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Email already registered. Please use a different email or try logging in.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Email/password authentication is not enabled. Please contact support.';
        }
        
        showErrorMessage(errorMessage, registerForm);
        registerForm.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          registerForm.style.animation = '';
        }, 500);
      }

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }
}

// Enhanced Recipe Filtering with smooth animations
function initializeRecipeFiltering() {
  const recipeFilter = document.getElementById('recipe-filter');
  const recipeSearch = document.getElementById('recipe-search');

  if (recipeFilter) {
    recipeFilter.addEventListener('change', () => {
      filterRecipes();
      addFilterAnimation();
    });
  }

  if (recipeSearch) {
    recipeSearch.addEventListener('input', debounce(() => {
      filterRecipes();
      addFilterAnimation();
    }, 300));
  }

  function filterRecipes() {
    const filterValue = recipeFilter ? recipeFilter.value : 'all';
    const searchValue = recipeSearch ? recipeSearch.value.toLowerCase() : '';
    const recipeCards = document.querySelectorAll('.recipe-card');

    console.log('Filtering recipes:', { filterValue, searchValue, totalCards: recipeCards.length });

    if (recipeCards.length > 0) {
      recipeCards.forEach((card, index) => {
        const category = card.dataset.category;
        const titleElement = card.querySelector('.card-title');
        const descriptionElement = card.querySelector('.card-text');
        
        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const description = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';

        const matchesFilter = filterValue === 'all' || category === filterValue;
        const matchesSearch = title.includes(searchValue) || description.includes(searchValue);

        console.log('Card filtering:', { 
          category, 
          title: title.substring(0, 20) + '...', 
          matchesFilter, 
          matchesSearch 
        });

        if (matchesFilter && matchesSearch) {
          card.style.display = 'block';
          card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
        } else {
          card.style.display = 'none';
        }
      });
    }
  }

  function addFilterAnimation() {
    const filterContainer = document.querySelector('.recipe-filters');
    if (filterContainer) {
      filterContainer.style.transform = 'scale(1.02)';
      setTimeout(() => {
        filterContainer.style.transform = 'scale(1)';
      }, 200);
    }
  }

  // Debounce function for search
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Enhanced Subscription Handling
// DISABLED: Now using payment verification system (payment-verification.js)
// This old handler has been replaced with Ethiopian payment integration
function initializeSubscriptionHandling() {
  // Subscription handling is now done in payment-verification.js
  // This function is kept for backwards compatibility but does nothing
  return;
  
  /* OLD CODE COMMENTED OUT - DO NOT USE
  const subscriptionForms = document.querySelectorAll('.subscription-form');

  if (subscriptionForms.length > 0) {
    subscriptionForms.forEach(form => {
      form.addEventListener('click', async (e) => {
        e.preventDefault();

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
          // Show login prompt with animation
          const loginPrompt = document.createElement('div');
          loginPrompt.className = 'login-prompt';
          loginPrompt.innerHTML = `
            <div class="login-prompt-content">
              <h3>Please login to subscribe</h3>
              <p>You need to be logged in to access premium features.</p>
              <div class="login-prompt-buttons">
                <a href="login.html" class="btn btn-primary">Login</a>
                <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
              </div>
            </div>
          `;
          loginPrompt.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
          `;
          document.body.appendChild(loginPrompt);
          return;
        }

        const subscriptionLevel = form.dataset.subscriptionLevel;

        // Show loading state
        const originalText = form.textContent;
        form.textContent = 'Processing...';
        form.disabled = true;

        // Simulate subscription process
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update user subscription
        currentUser.subscriptionLevel = subscriptionLevel;
        currentUser.subscriptionDate = new Date().toISOString();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update user in users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.id === currentUser.id);

        if (userIndex !== -1) {
          users[userIndex].subscriptionLevel = subscriptionLevel;
          users[userIndex].subscriptionDate = new Date().toISOString();
          localStorage.setItem('users', JSON.stringify(users));
        }

        // Show success message with animation
        showSubscriptionSuccess(subscriptionLevel);

        // Reset button
        form.textContent = originalText;
        form.disabled = false;
      });
    });
  }
  */

  function showSubscriptionSuccess(level) {
    const successMessage = document.createElement('div');
    successMessage.className = 'subscription-success';
    successMessage.innerHTML = `
      <div class="subscription-success-content">
        <i class="fas fa-check-circle"></i>
        <h3>Subscription Successful!</h3>
        <p>You have successfully subscribed to the ${level.charAt(0).toUpperCase() + level.slice(1)} plan.</p>
        <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Continue</button>
      </div>
    `;
    successMessage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;
    document.body.appendChild(successMessage);
  }
}

// Enhanced Info Toggles with smooth animations
function initializeInfoToggles() {
  const infoToggles = document.querySelectorAll('.info-toggle');

  if (infoToggles.length > 0) {
    infoToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        const icon = toggle.querySelector('i') || toggle;

        if (content) {
          const isActive = content.classList.contains('active');
          
          if (isActive) {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            setTimeout(() => {
              content.classList.remove('active');
              toggle.textContent = 'Learn More';
            }, 300);
          } else {
            content.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            toggle.textContent = 'Show Less';
          }
        }
      });
    });
  }
}

// Scroll Animations for better UX
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease-out both';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards and sections
  document.querySelectorAll('.card, .section-title, .plan-card').forEach(el => {
    observer.observe(el);
  });
}

// Lazy Loading for images
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Smooth Scrolling for anchor links
function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Enhanced Authentication Check with Firebase
async function checkAuth() {
  const authNav = document.querySelector('.auth-nav');
  const contentElements = document.querySelectorAll('.premium-content');

  console.log('checkAuth: Starting...');
  console.log('checkAuth: authNav element found:', !!authNav);

  // Import Firebase auth service
  let authService;
  try {
    console.log('checkAuth: Loading Firebase auth service...');
    let firebaseModule;
    try {
      firebaseModule = await import('../../firebase-config.js');
    } catch (e) {
      firebaseModule = await import('/firebase-config.js');
    }
    authService = firebaseModule.authService;
    console.log('checkAuth: Firebase auth service loaded');
  } catch (error) {
    console.error('Failed to load Firebase auth:', error);
    return;
  }

  // Listen for auth state changes
  console.log('checkAuth: Setting up auth state listener...');
  authService.onAuthStateChange(async (user) => {
    console.log('checkAuth: Auth state changed, user:', user ? user.email : 'null');
    
    // Re-query authNav in case it wasn't available before
    const currentAuthNav = document.querySelector('.auth-nav');
    console.log('checkAuth: Current authNav element found:', !!currentAuthNav);
    
    if (user) {
      // User is logged in
      console.log('checkAuth: User is logged in, fetching user data...');
      const userData = await authService.getUserData(user.uid);
      console.log('checkAuth: User data retrieved:', userData);
      
      if (currentAuthNav && userData) {
        console.log('checkAuth: Updating navbar with user info...');
        currentAuthNav.innerHTML = `
          <li><a href="#" class="user-profile">
            <i class="fas fa-user-circle"></i>
            Welcome, ${userData.name}
          </a></li>
          <li><a href="#" class="logout-btn" id="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </a></li>
        `;
        console.log('checkAuth: Navbar updated successfully');

        // Add logout functionality with confirmation
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          // Remove any existing listeners by cloning the element
          const newLogoutBtn = logoutBtn.cloneNode(true);
          logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
          
          newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const confirmLogout = confirm('Are you sure you want to logout?');
            if (confirmLogout) {
              try {
                console.log('Logging out...');
                await authService.logout();
                console.log('Logout successful, reloading page...');
                window.location.href = 'index.html';
              } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to logout: ' + error.message);
              }
            }
          });
        }
      }

      // Show premium content based on subscription level
      if (contentElements.length > 0 && userData) {
        contentElements.forEach(element => {
          const requiredLevel = element.dataset.subscriptionLevel || 'free';
          const userLevel = userData.subscriptionLevel || 'free';

          const levels = {
            'free': 0,
            'gold': 1,
            'platinum': 2
          };

          if (levels[userLevel] >= levels[requiredLevel]) {
            element.style.display = 'block';
            element.style.animation = 'fadeInUp 0.5s ease-out';
          }
        });
      }
    } else {
      // User is logged out - show default auth nav
      console.log('checkAuth: User is logged out, showing Sign Up button');
      if (currentAuthNav) {
        currentAuthNav.innerHTML = `
          <li><a href="login.html">Sign Up</a></li>
        `;
        console.log('checkAuth: Sign Up button displayed');
      }
    }
  });
}

// Recipe data - will be loaded from Firebase
let recipes = [];

// Load recipes from Firebase
async function loadRecipesFromFirebase() {
  try {
    console.log('Importing Firebase config...');
    let firebaseModule;
    try {
      firebaseModule = await import('../../firebase-config.js');
    } catch (e) {
      firebaseModule = await import('/firebase-config.js');
    }
    const { recipeService } = firebaseModule;
    console.log('Firebase config imported successfully');
    
    console.log('Getting recipes from Firebase...');
    recipes = await recipeService.getRecipes();
    console.log('Recipes loaded from Firebase:', recipes.length);
    console.log('Recipes:', recipes);
    
    // Update recipe displays if on recipes page
    if (window.location.pathname.includes('recipes.html')) {
      console.log('On recipes page, calling displayRecipes...');
      displayRecipes();
    }
    
    // Update featured recipes if on homepage
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
      displayFeaturedRecipes();
    }
    
    // Update recipe detail page if on recipe detail page
    if (window.location.pathname.includes('recipe-detail.html')) {
      initRecipeDetailPage();
    }
  } catch (error) {
    console.error('Error loading recipes from Firebase:', error);
    console.log('Falling back to sample recipes...');
    // Fallback to sample recipes if Firebase fails
    recipes = [
      {
        id: 'sample-1',
    title: 'Doro Wat (Ethiopian Chicken Stew)',
    category: 'main',
    description: 'A spicy Ethiopian chicken stew with berbere spice and hard-boiled eggs.',
    difficulty: 'Medium',
    prepTime: '30 mins',
    cookTime: '1 hr 30 mins',
    servings: 4,
    ingredients: [
      '2 lbs chicken thighs, bone-in',
      '3 tbsp niter kibbeh (Ethiopian spiced butter)',
      '2 large onions, finely diced',
      '3 tbsp berbere spice mix',
      '4 cloves garlic, minced',
      '1 tbsp fresh ginger, grated',
      '1 cup chicken broth',
      '4 hard-boiled eggs',
      'Salt to taste'
    ],
    instructions: [
          'Heat niter kibbeh in a large pot over medium heat',
          'Add onions and cook until golden brown, about 10 minutes',
          'Add garlic and ginger, cook for 2 minutes',
          'Add berbere spice and cook for 1 minute to release flavors',
          'Add chicken pieces and brown on all sides',
          'Pour in chicken broth and bring to a simmer',
          'Cover and cook for 1 hour, until chicken is tender',
          'Add hard-boiled eggs and simmer for 10 more minutes',
          'Season with salt and serve hot with injera'
        ],
        tips: [
          'For authentic flavor, use homemade niter kibbeh',
          'Adjust berbere amount based on your spice tolerance',
          'The stew should be thick and rich, not watery'
        ],
        subscriptionLevel: 'gold'
      },
      {
        id: 'sample-2',
    title: 'Misir Wat (Ethiopian Red Lentil Stew)',
    category: 'vegetarian',
    description: 'A hearty and flavorful vegan Ethiopian lentil stew.',
    difficulty: 'Easy',
    prepTime: '15 mins',
    cookTime: '45 mins',
        servings: 6,
    ingredients: [
      '2 cups red lentils, rinsed',
          '3 tbsp niter kibbeh or olive oil',
          '1 large onion, diced',
      '3 cloves garlic, minced',
          '1 tbsp fresh ginger, grated',
      '2 tbsp berbere spice',
          '4 cups vegetable broth',
      'Salt to taste'
    ],
    instructions: [
          'Rinse lentils thoroughly and set aside',
          'Heat niter kibbeh in a large pot over medium heat',
          'Add onions and cook until translucent',
          'Add garlic and ginger, cook for 2 minutes',
          'Add berbere spice and cook for 1 minute',
          'Add lentils and vegetable broth',
          'Bring to a boil, then reduce heat and simmer',
          'Cook for 30-40 minutes until lentils are soft',
          'Season with salt and serve hot'
        ],
        tips: [
          'Red lentils cook faster than other varieties',
          'The stew should be thick and creamy',
          'Great for meal prep and freezing'
        ],
    subscriptionLevel: 'free'
  }
];
  }
}

// Display recipes on recipes page
function displayRecipes() {
  console.log('displayRecipes called with recipes:', recipes);
  // Look for both possible container names
  const recipesContainer = document.querySelector('.recipes-grid') || document.querySelector('#recipesGrid');
  if (!recipesContainer) {
    console.log('Recipes container not found');
    return;
  }

  if (recipes.length === 0) {
    recipesContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No recipes available. Add some recipes in the admin panel!</p>';
    return;
  }

           recipesContainer.innerHTML = recipes.map(recipe => `
           <div class="card recipe-card" data-category="${recipe.category}" data-difficulty="${recipe.difficulty}" data-recipe-id="${recipe.id}">
             ${recipe.subscriptionLevel !== 'free' ? `<span class="premium-badge ${recipe.subscriptionLevel === 'platinum' ? 'platinum-badge' : ''}">${recipe.subscriptionLevel.charAt(0).toUpperCase() + recipe.subscriptionLevel.slice(1)}</span>` : ''}
             <img src="${recipe.imageUrl || `/images/${recipe.category}.jpg`}" alt="${recipe.title}" class="card-img">
             <div class="card-content">
               <h3 class="card-title">${recipe.title}</h3>
               <p class="card-text">${recipe.description}</p>
               <div class="recipe-meta" style="margin-bottom: 1rem; color: #666; font-size: 0.9rem;">
                 <span style="margin-right: 1rem;"><i class="far fa-clock"></i> ${recipe.prepTime} + ${recipe.cookTime}</span>
                 <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
               </div>
               <a href="#" class="btn btn-primary" onclick="loadRecipeDetail('${recipe.id}'); return false;">View Recipe</a>
             </div>
           </div>
         `).join('');
  
  // Re-initialize filtering after recipes are loaded
  console.log('Recipes displayed, re-initializing filters...');
  initializeRecipeFiltering();
}

// Display featured recipes on homepage
function displayFeaturedRecipes() {
  // Look for the card-grid container on the homepage
  const featuredContainer = document.querySelector('.card-grid');
  if (!featuredContainer) {
    console.log('Featured recipes container not found');
    return;
  }

  const featuredRecipes = recipes.slice(0, 3); // Show first 3 recipes

  if (featuredRecipes.length === 0) {
    featuredContainer.innerHTML = '<p>No recipes available. Add some recipes in the admin panel!</p>';
    return;
  }

  featuredContainer.innerHTML = featuredRecipes.map(recipe => `
    <div class="card recipe-card" data-category="${recipe.category}" data-recipe-id="${recipe.id}">
      <img src="${recipe.imageUrl || `/images/${recipe.category}.jpg`}" alt="${recipe.title}" class="card-img">
      <div class="card-content">
        <h3 class="card-title">${recipe.title}</h3>
        <p class="card-text">${recipe.description}</p>
        <a href="#" class="btn btn-primary" onclick="loadRecipeDetail('${recipe.id}'); return false;">View Recipe</a>
      </div>
    </div>
  `).join('');
  
  // Re-initialize filtering after featured recipes are loaded
  console.log('Featured recipes displayed, re-initializing filters...');
  initializeRecipeFiltering();
}

// Enhanced Recipe Detail Loading
function loadRecipeDetail(recipeId) {
  console.log('Loading recipe detail for ID:', recipeId);
  console.log('Available recipes:', recipes);
  
  const recipe = recipes.find(r => r.id === recipeId);
  

  
  if (!recipe) {
    console.error('Recipe not found');
    return;
  }

  // Subscription access check - Use Firebase Auth
  const currentUser = window.currentUser; // Set by checkAuth() function
  const recipeLevel = recipe.subscriptionLevel || 'free';
  const userLevel = currentUser ? (currentUser.subscriptionLevel || 'free') : 'free';
  const levels = { free: 0, gold: 1, platinum: 2 };
  // Debug log
  console.log('User level:', userLevel, '| Recipe level:', recipeLevel);

  // Only restrict if recipe is gold or platinum
  if (levels[recipeLevel] > 0 && levels[userLevel] < levels[recipeLevel]) {
    // Show access restriction modal
    const modal = document.createElement('div');
    modal.className = 'access-modal';
    let planName = recipeLevel.charAt(0).toUpperCase() + recipeLevel.slice(1);
    modal.innerHTML = `
      <div class="access-modal-content">
        <button class="modal-close">&times;</button>
        <h2>Upgrade Required</h2>
        <p>This recipe is available to <strong>${planName}</strong> subscribers and above.</p>
        <p>Your current plan does not include access to this recipe.</p>
        <div style="margin-top: 2rem;">
          <a href="subscription.html" class="btn btn-primary">Upgrade Now</a>
          <button class="btn btn-outline modal-close">Cancel</button>
            </div>
          </div>
        `;
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;
    const modalContent = modal.querySelector('.access-modal-content');
    modalContent.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 20px;
      max-width: 400px;
      text-align: center;
      position: relative;
      animation: slideInUp 0.3s ease-out;
    `;
    // Close functionality
    modal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
      });
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
      }
    });
    document.body.appendChild(modal);
    return;
  }

  // Create modal for recipe detail
  const modal = document.createElement('div');
  modal.className = 'recipe-modal';
  modal.innerHTML = `
    <div class="recipe-modal-content">
      <button class="modal-close">&times;</button>
          <div class="recipe-header">
            <h1>${recipe.title}</h1>
            <div class="recipe-meta">
          <span><i class="far fa-clock"></i> Prep: ${recipe.prepTime}</span>
          <span><i class="fas fa-fire"></i> Cook: ${recipe.cookTime}</span>
          <span><i class="fas fa-users"></i> Serves: ${recipe.servings}</span>
          <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
            </div>
          </div>

          <div class="recipe-description">
            <p>${recipe.description}</p>
          </div>

          <div class="recipe-ingredients">
        <h3><i class="fas fa-list"></i> Ingredients</h3>
            <ul class="ingredients-list">
              ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
          </div>

          <div class="recipe-instructions">
        <h3><i class="fas fa-utensils"></i> Instructions</h3>
            <ol class="instructions-list">
              ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
          </div>

      ${recipe.tips ? `
        <div class="recipe-tips">
          <h3><i class="fas fa-lightbulb"></i> Tips</h3>
          <ul class="tips-list">
            ${recipe.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  // Add styles
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;

  const modalContent = modal.querySelector('.recipe-modal-content');
  modalContent.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 20px;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: slideInUp 0.3s ease-out;
  `;

  // Close functionality
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
  `;

  closeBtn.addEventListener('click', () => {
    modal.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => modal.remove(), 300);
    }
  });

  document.body.appendChild(modal);
}

// Initialize recipe detail page if on recipe detail page
function initRecipeDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');
  
  if (recipeId) {
    loadRecipeDetail(parseInt(recipeId));
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideInUp {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .auth-message {
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    text-align: center;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .auth-message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .auth-message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .login-prompt-content,
  .subscription-success-content {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    max-width: 400px;
    animation: slideInUp 0.3s ease-out;
  }
  
  .login-prompt-buttons,
  .subscription-success-content {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .info-content {
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s ease;
    opacity: 0;
  }
  
  .info-content.active {
    max-height: 200px;
    opacity: 1;
  }
`;

document.head.appendChild(style);

// Make functions globally accessible
window.loadRecipeDetail = loadRecipeDetail;

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

// Sliding Auth Form Functionality
function initializeSlidingAuthForm() {
  const signUpButton = document.getElementById('signUp');
  const signInButton = document.getElementById('signIn');
  const authContainer = document.getElementById('container');

  if (signUpButton && signInButton && authContainer) {
    signUpButton.addEventListener('click', () => {
      authContainer.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
      authContainer.classList.remove("right-panel-active");
    });
  }
}

// Hidden admin access - Press Ctrl+Shift+A to access admin panel
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    window.location.href = 'admin.html';
  }
});
