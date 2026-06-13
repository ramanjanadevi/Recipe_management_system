
document.addEventListener('DOMContentLoaded', () => {
    displayFavorites();
});

function displayFavorites() {
    console.log('Displaying favorites...');
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    console.log('Favorites from localStorage:', favorites);
    const favoritesGrid = document.getElementById('favoritesGrid');

    // Check if there are no favorites
    if (favorites.length === 0) {
        console.log('No favorites found');
        favoritesGrid.innerHTML = '<p class="text-center col-span-3 text-gray-600">No favorite recipes yet!</p>';
        return;
    }

   
    
        // Update the grid container layout
        favoritesGrid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto md:ml-0";
        
        favoritesGrid.innerHTML = favorites.map(recipe => `
            <div class="recipe-card bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 mx-auto md:mx-0" data-id="${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-full object-cover" />
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-1">${recipe.name}</h3>
                    <span class="inline-block bg-[#f4b266] text-white px-3 py-1 rounded-full text-sm mb-1">${recipe.category}</span>
                    <p class="text-gray-600 mb-3">${recipe.description.substring(0, 150)}...</p>
                    <div class="flex space-x-3">
                        <button onclick="removeFromFavorites('${recipe.id}')" class="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold hover:bg-gray-600 transition-colors flex items-center">
                            <i class="fas fa-trash-alt mr-2"></i> Remove
                        </button>
                        <button onclick="viewRecipe('${recipe.id}')" class="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold hover:bg-gray-600 transition-colors flex items-center">
                            <i class="fas fa-eye mr-2"></i> Explore
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        setTimeout(() => {
            const cards = document.querySelectorAll('.recipe-card');
            cards.forEach(card => {
                card.classList.add('animate-in');
            });
        }, 100);
    
}


function removeFromFavorites(recipeId) {
    // Show SweetAlert confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        text: 'This recipe will be removed from your favorites!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f4b266',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            // Find the card element before removing from storage
            const card = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
            
            if (card) {
                // Add exit animation
                card.style.transform = 'translateY(20px)';
                card.style.opacity = '0';
                card.style.transition = 'all 0.3s ease-out';
                
                // Wait for animation to complete before removing
                setTimeout(() => {
                    // Remove from localStorage
                    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
                    favorites = favorites.filter(recipe => recipe.id !== recipeId);
                    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
                    
                    // Refresh the displayed favorites
                    displayFavorites();
                    
                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Removed!',
                        text: 'Recipe removed from favorites!',
                        confirmButtonColor: '#f4b266',
                    });
                }, 300);
            } else {
                // Fallback if card element not found - just remove immediately
                let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
                favorites = favorites.filter(recipe => recipe.id !== recipeId);
                localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
                
                // Refresh the displayed favorites
                displayFavorites();
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    text: 'Recipe removed from favorites!',
                    confirmButtonColor: '#f4b266',
                });
            }
        }
    });
}

function goBack() {
    // Always redirect to the home page
    window.location.href = "yum.html";
}

// Add event listener to the back button once the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
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

function viewRecipe(recipeId) {
    window.location.href = `recipe-detail.html?id=${recipeId}`;
}

// Add missing logout function
function logout() {
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
            // Sign out from Firebase
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().then(() => {
                    // Clear session data
                    localStorage.removeItem('user');
                    sessionStorage.clear();
                    
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
            } else {
                // Fallback if Firebase is not available
                localStorage.removeItem('user');
                sessionStorage.clear();
                
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    confirmButtonColor: '#ff6b6b'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }
        }
    });
}

// Make logout function globally available
window.logout = logout;