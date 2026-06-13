// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCM1uHjz6cse2smLJXvoqItgJfx7GxbOm0",
    authDomain: "recipe-management-system-bf5a1.firebaseapp.com",
    projectId: "recipe-management-system-bf5a1",
    storageBucket: "recipe-management-system-bf5a1.firebasestorage.app",
    messagingSenderId: "299256818769",
    appId: "1:299256818769:web:3201aa5d4830db53c25c70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get category from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');

// Update category title
document.getElementById('categoryTitle').textContent =
    category ? category.charAt(0).toUpperCase() + category.slice(1) + ' Recipes' : 'All Recipes';

let allRecipes = [];

// Function to create shimmer loading cards - disabled
function createShimmerCards() {
    console.log('Shimmer cards disabled - using simple text loader');
    return;
}

// Fetch recipes from Firestore
async function fetchRecipes() {
    try {
        console.log('Fetching recipes from Firestore...');

        // Show loader and hide recipe grid
        const loader = document.getElementById('loader');
        const recipeGrid = document.getElementById('recipeGrid');

        if (loader) {
            loader.style.display = 'flex';
            console.log('Loader displayed');
        } else {
            console.error('Loader element not found!');
        }

        if (recipeGrid) {
            recipeGrid.style.display = 'none';
            console.log('Recipe grid hidden');
        }

        // Fetch data from Firestore
        const recipesRef = collection(db, 'recipes');
        let recipeQuery;

        if (category) {
            recipeQuery = query(recipesRef, where('category', '==', category));
            console.log('Fetching recipes for category:', category);
        } else {
            recipeQuery = recipesRef;
            console.log('Fetching all recipes');
        }

        const querySnapshot = await getDocs(recipeQuery);
        console.log('Fetched', querySnapshot.size, 'recipes');

        allRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Hide loader and show recipe grid
        if (loader) {
            loader.style.display = 'none';
            console.log('Loader hidden');
        }

        if (recipeGrid) {
            recipeGrid.style.display = 'grid';
            console.log('Recipe grid displayed');
        }

        // Display recipes
        displayRecipes(allRecipes);
    } catch (error) {
        console.error("Error fetching recipes: ", error);

        // Hide loader and show error message
        const loader = document.getElementById('loader');
        const recipeGrid = document.getElementById('recipeGrid');

        if (loader) loader.style.display = 'none';
        if (recipeGrid) {
            recipeGrid.style.display = 'grid';
            recipeGrid.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-red-500">Error loading recipes. Please try again later.</p></div>';
        }
    }
}

// Display recipes in the grid
function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

// Create recipe card element
function createRecipeCard(recipe) {
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    const isFavorite = favorites.some(fav => fav.id === recipe.id);

    const card = document.createElement('div');
    card.className = 'recipe-card bg-white rounded-lg shadow-lg overflow-hidden';

    // Store recipe data in a data attribute instead of passing JSON string
    card.setAttribute('data-recipe-id', recipe.id);

    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-64 object-cover"/>
        <div class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold">${recipe.name}</h3>
                <button onclick="toggleFavorite(event, '${recipe.id}')" class="focus:outline-none">
                    <svg class="w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'}"
                         fill="${isFavorite ? 'currentColor' : 'none'}"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
            <span class="inline-block bg-[#f4b266] text-white px-3 py-1 rounded-full text-sm mb-3">${recipe.category}</span>
            <p class="text-gray-600 mb-4">${recipe.description ? recipe.description.substring(0, 150) : ''}...</p>
            <button onclick="viewRecipe('${recipe.id}')" class="explore-btn text-white px-6 py-2 rounded-full font-bold">Explore Recipe</button>
        </div>
    `;
    return card;
}

// Toggle favorite status of recipe
window.toggleFavorite = function(event, recipeId) {
    event.stopPropagation();
    try {
        console.log('Toggle favorite clicked!');
        console.log('Recipe ID:', recipeId);
        
        // Find the recipe in allRecipes array
        const recipe = allRecipes.find(r => r.id === recipeId);
        if (!recipe) {
            throw new Error('Recipe not found');
        }
        
        console.log('Found recipe:', recipe);
        
        let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
        console.log('Current favorites:', favorites);
        
        const existingIndex = favorites.findIndex(fav => fav.id === recipeId);
        console.log('Existing index:', existingIndex);

        if (existingIndex >= 0) {
            console.log('Removing from favorites');
            favorites.splice(existingIndex, 1);
        } else {
            console.log('Adding to favorites');
            favorites.push(recipe);
        }

        console.log('Updated favorites:', favorites);
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
        displayRecipes(allRecipes); // Refresh the display to update heart icons
        
        // Show feedback to user
        Swal.fire({
            title: existingIndex >= 0 ? 'Removed from Favorites!' : 'Added to Favorites!',
            text: existingIndex >= 0 ? 'Recipe removed from your favorites.' : 'Recipe added to your favorites!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#f4b266'
        });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to update favorites: ' + error.message,
            icon: 'error',
            confirmButtonColor: '#ff6b6b'
        });
    }
};

// // Search recipes by name
// window.searchRecipes = function() {
//     const query = document.getElementById('searchInput').value.toLowerCase();
//     const filteredRecipes = allRecipes.filter(recipe =>
//         recipe.name.toLowerCase().includes(query)
//     );
//     displayRecipes(filteredRecipes);
// };
// Function to handle search
window.searchRecipes = function() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filteredRecipes = allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query)
    );
    displayRecipes(filteredRecipes);
};

// Add event listener for Enter key
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchRecipes(); // Trigger search when Enter is pressed
    }
});

// Optional: Add event listener to the search button
document.getElementById('searchButton').addEventListener('click', function() {
    searchRecipes(); // Trigger search when the button is clicked
});

// Navigate to recipe detail page
window.viewRecipe = function(recipeId) {
    window.location.href = `recipe-detail.html?id=${recipeId}`;
};

// Logout function
window.logout = function() {
    Swal.fire({
        title: 'Logout Confirmation',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff6b6b',
        cancelButtonColor: '#808080',
        confirmButtonText: 'Yes, logout!'
    }).then((result) => {
        if (result.isConfirmed) {
            signOut(auth).then(() => {
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    confirmButtonColor: '#ff6b6b'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }).catch((error) => {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to logout: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#ff6b6b'
                });
            });
        }
    });
};

// Check authentication state and fetch recipes
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        fetchRecipes();
    }
});
function goBack() {
    // Always redirect to the home page
    window.location.href = "yum.html";
}

// Add event listener to the back button once the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');

    // Initialize loader
    const loader = document.getElementById('loader');
    const recipeGrid = document.getElementById('recipeGrid');

    if (loader) {
        loader.style.display = 'flex';
        console.log('Loader initialized on page load');
    } else {
        console.error('Loader element not found on page load');
    }

    if (recipeGrid) {
        recipeGrid.style.display = 'none';
        console.log('Recipe grid hidden on page load');
    }

    // Setup back button
    const backButton = document.querySelector('.back-btn');
    if (backButton) {
        // Ensure the button is visible
        backButton.style.display = "inline-block";
        backButton.style.visibility = "visible";
        backButton.style.opacity = "1";
        // Add background color to make it more noticeable
        backButton.style.backgroundColor = "#ca8a04";

        backButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default action
            goBack();
        });
    } else {
        console.error("Back button not found in the DOM");
    }
});