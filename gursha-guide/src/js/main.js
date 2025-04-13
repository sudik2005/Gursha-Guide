// DOM Elements Selection
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu functionality
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
    });
  }

  // Authentication functionality (simulated for now)
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authMessage = document.querySelector('.auth-message');

  // Simulated user storage
  const users = JSON.parse(localStorage.getItem('users')) || [];

  // Check if user is logged in
  const checkAuth = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authNav = document.querySelector('.auth-nav');
    const contentElements = document.querySelectorAll('.premium-content');

    if (currentUser) {
      if (authNav) {
        authNav.innerHTML = `
          <li><a href="#" class="user-profile">Welcome, ${currentUser.name}</a></li>
          <li><a href="#" class="logout-btn">Logout</a></li>
        `;

        // Add logout functionality
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
          });
        }
      }

      // Show premium content based on subscription level
      if (contentElements.length > 0) {
        contentElements.forEach(element => {
          const requiredLevel = element.dataset.subscriptionLevel || 'free';
          const userLevel = currentUser.subscriptionLevel || 'free';

          const levels = {
            'free': 0,
            'gold': 1,
            'platinum': 2
          };

          if (levels[userLevel] >= levels[requiredLevel]) {
            element.style.display = 'block';
          }
        });
      }
    }
  };

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = loginForm.querySelector('input[name="email"]').value;
      const password = loginForm.querySelector('input[name="password"]').value;

      const user = users.find(user => user.email === email && user.password === password);

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAuthMessage('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        showAuthMessage('Invalid email or password', 'error');
      }
    });
  }

  // Registration form submission
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = registerForm.querySelector('input[name="name"]').value;
      const email = registerForm.querySelector('input[name="email"]').value;
      const password = registerForm.querySelector('input[name="password"]').value;

      // Check if user already exists
      if (users.some(user => user.email === email)) {
        showAuthMessage('Email already registered', 'error');
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        subscriptionLevel: 'free'
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      showAuthMessage('Registration successful! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // Display authentication messages
  function showAuthMessage(message, type) {
    if (authMessage) {
      authMessage.textContent = message;
      authMessage.className = 'auth-message';
      authMessage.classList.add(type);
      authMessage.style.display = 'block';

      setTimeout(() => {
        authMessage.style.display = 'none';
      }, 3000);
    }
  }

  // Recipe filtering functionality
  const recipeFilter = document.getElementById('recipe-filter');
  const recipeSearch = document.getElementById('recipe-search');
  const recipeCards = document.querySelectorAll('.recipe-card');

  if (recipeFilter) {
    recipeFilter.addEventListener('change', filterRecipes);
  }

  if (recipeSearch) {
    recipeSearch.addEventListener('input', filterRecipes);
  }

  function filterRecipes() {
    const filterValue = recipeFilter ? recipeFilter.value : 'all';
    const searchValue = recipeSearch ? recipeSearch.value.toLowerCase() : '';

    if (recipeCards.length > 0) {
      recipeCards.forEach(card => {
        const category = card.dataset.category;
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-text').textContent.toLowerCase();

        const matchesFilter = filterValue === 'all' || category === filterValue;
        const matchesSearch = title.includes(searchValue) || description.includes(searchValue);

        if (matchesFilter && matchesSearch) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  }

  // Initialize authentication check
  checkAuth();

  // Subscription form handling
  const subscriptionForms = document.querySelectorAll('.subscription-form');

  if (subscriptionForms.length > 0) {
    subscriptionForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
          window.location.href = 'login.html';
          return;
        }

        const subscriptionLevel = form.dataset.subscriptionLevel;

        // Update user subscription
        currentUser.subscriptionLevel = subscriptionLevel;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update user in users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.id === currentUser.id);

        if (userIndex !== -1) {
          users[userIndex].subscriptionLevel = subscriptionLevel;
          localStorage.setItem('users', JSON.stringify(users));
        }

        // Show success message
        alert(`You have successfully subscribed to the ${subscriptionLevel.charAt(0).toUpperCase() + subscriptionLevel.slice(1)} plan!`);

        // Redirect to home page
        window.location.href = 'index.html';
      });
    });
  }

  // Ethiopian cuisine info toggles
  const infoToggles = document.querySelectorAll('.info-toggle');

  if (infoToggles.length > 0) {
    infoToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;

        if (content) {
          content.classList.toggle('active');
          toggle.textContent = content.classList.contains('active') ? 'Show Less' : 'Learn More';
        }
      });
    });
  }
});

// Recipe data - this would be fetched from a backend in a real scenario
const recipes = [
  {
    id: 1,
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
      'In a large pot, sauté onions until deeply caramelized, about 20 minutes.',
      'Add niter kibbeh, garlic, and ginger. Cook for 2-3 minutes until fragrant.',
      'Stir in berbere spice and mix well.',
      'Add chicken pieces and coat well with the spice mixture.',
      'Pour in chicken broth, bring to a simmer, then reduce heat.',
      'Cover and cook for 45-60 minutes until chicken is tender.',
      'Add hard-boiled eggs and simmer for another 15 minutes.',
      'Serve hot with injera bread.'
    ],
    image: '/images/doro-wat.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-1',
    subscriptionLevel: 'free'
  },
  {
    id: 2,
    title: 'Injera (Ethiopian Sourdough Flatbread)',
    category: 'bread',
    description: 'The traditional Ethiopian sourdough flatbread that serves as both plate and utensil.',
    difficulty: 'Hard',
    prepTime: '3 days (fermentation)',
    cookTime: '15 mins',
    servings: 6,
    ingredients: [
      '4 cups teff flour',
      '5 cups water',
      '1 tsp active dry yeast (optional)',
      'Salt to taste'
    ],
    instructions: [
      'Mix teff flour with water to create a thin batter.',
      'Cover and let ferment at room temperature for 2-3 days.',
      'Stir the batter daily to incorporate air.',
      'On the day of cooking, add salt and stir well.',
      'Heat a large non-stick pan or traditional mitad.',
      'Pour the batter in a spiral pattern to cover the pan.',
      'Cover and cook until bubbles form and the edges lift, about 2-3 minutes.',
      'Remove and let cool. The injera should be slightly spongy with a tangy flavor.'
    ],
    image: '/images/injera.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-2',
    subscriptionLevel: 'free'
  },
  {
    id: 3,
    title: 'Misir Wat (Ethiopian Red Lentil Stew)',
    category: 'vegetarian',
    description: 'A hearty and flavorful vegan Ethiopian lentil stew.',
    difficulty: 'Easy',
    prepTime: '15 mins',
    cookTime: '45 mins',
    servings: 4,
    ingredients: [
      '2 cups red lentils, rinsed',
      '1 large onion, finely chopped',
      '3 tbsp niter kibbeh or olive oil for vegan option',
      '3 cloves garlic, minced',
      '1 tbsp ginger, grated',
      '2 tbsp berbere spice',
      '4 cups water or vegetable broth',
      'Salt to taste'
    ],
    instructions: [
      'In a large pot, sauté onions until golden brown.',
      'Add niter kibbeh (or oil), garlic, and ginger. Cook until fragrant.',
      'Stir in berbere spice and mix well.',
      'Add lentils and stir to coat with the spice mixture.',
      'Pour in water or broth, bring to a boil, then reduce heat.',
      'Simmer for 30-40 minutes until lentils are soft and the stew thickens.',
      'Season with salt to taste.',
      'Serve hot with injera bread.'
    ],
    image: '/images/misir-wat.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-3',
    subscriptionLevel: 'free'
  },
  {
    id: 4,
    title: 'Kitfo (Ethiopian Spiced Steak Tartare)',
    category: 'main',
    description: 'A traditional Ethiopian dish of raw minced beef seasoned with mitmita and niter kibbeh.',
    difficulty: 'Medium',
    prepTime: '20 mins',
    cookTime: '0 mins (raw) or 5 mins (lightly cooked)',
    servings: 4,
    ingredients: [
      '1 lb high-quality lean beef tenderloin, freshly ground',
      '3 tbsp niter kibbeh (Ethiopian spiced butter)',
      '2 tbsp mitmita (Ethiopian chili powder)',
      '1 tbsp korarima (Ethiopian cardamom), ground',
      'Salt to taste',
      'Ayib (Ethiopian cottage cheese) for serving',
      'Fresh greens for serving'
    ],
    instructions: [
      'Ensure the beef is freshly ground from a trusted source.',
      'In a bowl, combine the minced beef with melted niter kibbeh.',
      'Add mitmita, korarima, and salt. Mix thoroughly.',
      'For traditional kitfo, serve immediately while still raw.',
      'For kitfo leb leb (lightly cooked), briefly heat in a pan for just a few minutes.',
      'Serve with ayib (Ethiopian cottage cheese) and fresh greens.',
      'Enjoy with injera bread.'
    ],
    image: '/images/kitfo.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-4',
    subscriptionLevel: 'gold'
  },
  {
    id: 5,
    title: 'Shiro (Ethiopian Chickpea Stew)',
    category: 'vegetarian',
    description: 'A smooth, spiced Ethiopian stew made from ground chickpea flour.',
    difficulty: 'Easy',
    prepTime: '10 mins',
    cookTime: '30 mins',
    servings: 4,
    ingredients: [
      '1 1/2 cups shiro powder (ground chickpea flour)',
      '1 large onion, finely chopped',
      '3 cloves garlic, minced',
      '2 tbsp niter kibbeh or olive oil for vegan option',
      '1 tbsp berbere spice (adjust to taste)',
      '4 cups water',
      'Salt to taste'
    ],
    instructions: [
      'In a pot, sauté onions until translucent.',
      'Add garlic and sauté for another minute.',
      'Stir in niter kibbeh or oil.',
      'Gradually add shiro powder while whisking to prevent lumps.',
      'Add berbere spice and mix well.',
      'Slowly pour in water while continuing to whisk.',
      'Bring to a simmer and cook for 20-25 minutes, stirring occasionally.',
      'Add salt to taste.',
      'Serve hot with injera bread.'
    ],
    image: '/images/shiro.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-5',
    subscriptionLevel: 'free'
  },
  {
    id: 6,
    title: 'Tibs (Ethiopian Sautéed Meat)',
    category: 'main',
    description: 'A flavorful Ethiopian dish of sautéed meat and vegetables.',
    difficulty: 'Medium',
    prepTime: '15 mins',
    cookTime: '25 mins',
    servings: 4,
    ingredients: [
      '1.5 lbs beef or lamb, cut into small cubes',
      '2 onions, sliced',
      '2 tomatoes, diced',
      '2 jalapeños, sliced (seeds removed for less heat)',
      '3 cloves garlic, minced',
      '1 tbsp fresh ginger, grated',
      '2 tbsp niter kibbeh or butter',
      '1 tbsp berbere spice',
      '1 tsp rosemary, dried',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Heat niter kibbeh in a large skillet or wok over high heat.',
      'Add beef or lamb cubes and sear on all sides until browned.',
      'Add onions and sauté until softened.',
      'Stir in garlic, ginger, berbere, and rosemary.',
      'Add tomatoes and jalapeños, continuing to stir-fry.',
      'Cook for about 10-15 more minutes until meat is cooked through but still tender.',
      'Season with salt and pepper to taste.',
      'Serve hot with injera bread.'
    ],
    image: '/images/tibs.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-6',
    subscriptionLevel: 'gold'
  },
  {
    id: 7,
    title: 'Ethiopian Coffee Ceremony',
    category: 'beverage',
    description: 'The traditional Ethiopian coffee ceremony, a ritual of hospitality and respect.',
    difficulty: 'Medium',
    prepTime: '30 mins',
    cookTime: '15 mins',
    servings: 6,
    ingredients: [
      '1 cup green Ethiopian coffee beans',
      '6 cups water',
      'Frankincense or other aromatic incense (optional)',
      'Popcorn for serving (traditional)'
    ],
    instructions: [
      'Wash the green coffee beans and roast them in a pan over medium heat until dark and oily.',
      'Grind the roasted beans coarsely, traditionally using a mortar and pestle.',
      'Prepare a traditional jebena (Ethiopian coffee pot) by rinsing with hot water.',
      'Add the ground coffee to the jebena and fill with water.',
      'Bring to a boil, then remove from heat to let grounds settle.',
      'Serve in small cups, pouring from a height to show skill and respect.',
      'Traditionally served with burning incense and popcorn.',
      'The ceremony typically involves three rounds of coffee: "Abol," "Tona," and "Baraka."'
    ],
    image: '/images/coffee-ceremony.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-7',
    subscriptionLevel: 'platinum'
  },
  {
    id: 8,
    title: 'Berbere Spice Mix',
    category: 'condiment',
    description: 'The essential Ethiopian spice blend that forms the base of many dishes.',
    difficulty: 'Easy',
    prepTime: '10 mins',
    cookTime: '5 mins',
    servings: 'Makes about 1 cup',
    ingredients: [
      '1/2 cup dried chili flakes',
      '1/4 cup paprika',
      '1 tbsp salt',
      '1 tbsp coriander seeds',
      '1 tbsp fenugreek seeds',
      '1 tbsp black peppercorns',
      '1 tsp cardamom seeds',
      '1 tsp ground ginger',
      '1 tsp ground cinnamon',
      '1 tsp ground allspice',
      '1/2 tsp ground cloves',
      '1/2 tsp ground nutmeg'
    ],
    instructions: [
      'Toast whole spices (coriander, fenugreek, peppercorns, and cardamom) in a dry pan until fragrant.',
      'Let the toasted spices cool, then grind them finely in a spice grinder.',
      'Mix with the remaining ground spices, chili flakes, and salt.',
      'Store in an airtight container.',
      'For best flavor, use within 3 months.',
      'Adjust heat level by varying the amount of chili flakes.'
    ],
    image: '/images/berbere.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample-video-8',
    subscriptionLevel: 'free'
  }
];

// Function to load recipe detail page
function loadRecipeDetail(recipeId) {
  const recipe = recipes.find(r => r.id === parseInt(recipeId));

  if (recipe) {
    // This would normally be handled by a server-side script
    // For demonstration purposes only
    localStorage.setItem('currentRecipe', JSON.stringify(recipe));
    window.location.href = 'recipe-detail.html';
  }
}

// Function to load recipe details on detail page
function initRecipeDetailPage() {
  const recipeDetail = document.querySelector('.recipe-detail');

  if (recipeDetail) {
    const recipe = JSON.parse(localStorage.getItem('currentRecipe'));

    if (recipe) {
      // Check user subscription level for premium content
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const userLevel = currentUser ? currentUser.subscriptionLevel : 'free';
      const levels = {
        'free': 0,
        'gold': 1,
        'platinum': 2
      };

      if (levels[userLevel] < levels[recipe.subscriptionLevel]) {
        recipeDetail.innerHTML = `
          <div class="container">
            <div class="subscription-required">
              <h2>Premium Recipe</h2>
              <p>This recipe is available to ${recipe.subscriptionLevel} subscribers and above.</p>
              <a href="subscription.html" class="btn btn-primary">Upgrade Subscription</a>
            </div>
          </div>
        `;
        return;
      }

      // Render recipe details
      recipeDetail.innerHTML = `
        <div class="container">
          <div class="recipe-header">
            <h1>${recipe.title}</h1>
            <div class="recipe-meta">
              <span><strong>Difficulty:</strong> ${recipe.difficulty}</span>
              <span><strong>Prep Time:</strong> ${recipe.prepTime}</span>
              <span><strong>Cook Time:</strong> ${recipe.cookTime}</span>
              <span><strong>Servings:</strong> ${recipe.servings}</span>
            </div>
          </div>

          <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">

          <div class="recipe-description">
            <p>${recipe.description}</p>
          </div>

          <div class="recipe-ingredients">
            <h2>Ingredients</h2>
            <ul class="ingredients-list">
              ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
          </div>

          <div class="recipe-instructions">
            <h2>Instructions</h2>
            <ol class="instructions-list">
              ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
          </div>

          <div class="recipe-video">
            <h2>Video Tutorial</h2>
            <iframe src="${recipe.videoUrl}" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      `;
    } else {
      recipeDetail.innerHTML = `
        <div class="container">
          <div class="recipe-not-found">
            <h2>Recipe Not Found</h2>
            <p>The recipe you're looking for doesn't exist or has been removed.</p>
            <a href="recipes.html" class="btn btn-primary">Browse Recipes</a>
          </div>
        </div>
      `;
    }
  }
}

// Initialize recipe detail page if applicable
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.recipe-detail')) {
    initRecipeDetailPage();
  }
});
