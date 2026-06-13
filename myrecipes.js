
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyCM1uHjz6cse2smLJXvoqItgJfx7GxbOm0",
    authDomain: "recipe-management-system-bf5a1.firebaseapp.com",
    projectId: "recipe-management-system-bf5a1",
    storageBucket: "recipe-management-system-bf5a1.firebasestorage.app",
    messagingSenderId: "299256818769",
    appId: "1:299256818769:web:3201aa5d4830db53c25c70"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User authenticated, showing loader...');

        // Show loader
        const loader = document.getElementById('loader');
        const recipesContainer = document.getElementById('recipesContainer');

        if (loader) {
            loader.style.display = 'flex';
            console.log('Loader display set to flex');
        } else {
            console.error('Loader element not found in onAuthStateChanged!');
        }

        if (recipesContainer) {
            recipesContainer.classList.add('hidden');
            console.log('Recipe container hidden');
        }

        // Load recipes immediately
        loadUserRecipes(user.uid);
    } else {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'index.html';
    }
});

async function loadUserRecipes(userId) {
    try {
        console.log('Loading user recipes for user ID:', userId);

        // Get references to loader and container
        const loader = document.getElementById('loader');
        const recipesContainer = document.getElementById("recipesContainer");

        console.log('Loader element found:', !!loader);
        console.log('Recipes container found:', !!recipesContainer);

        // Fetch data from Firebase
        console.log('Fetching data from Firebase...');
        const recipesRef = collection(db, 'recipes');
        const q = query(recipesRef, where("user.uid", "==", userId));
        const querySnapshot = await getDocs(q);
        console.log('Data fetched. Number of recipes:', querySnapshot.size);

        // Clear container
        if (recipesContainer) {
            recipesContainer.innerHTML = "";
            console.log('Recipes container cleared');
        }

        // Hide loader and show container
        if (loader) {
            loader.style.display = 'none';
            loader.style.visibility = 'hidden';
            loader.style.opacity = '0';
            console.log('Loader hidden with multiple style properties');
        } else {
            console.error('Loader element not found when trying to hide it!');
        }

        if (recipesContainer) {
            recipesContainer.classList.remove('hidden');
            recipesContainer.style.display = 'grid';
            console.log('Recipes container shown with explicit display:grid');
        }

        // Handle empty state
        if (querySnapshot.empty) {
            console.log('No recipes found');
            recipesContainer.innerHTML = "<p class='text-center text-gray-600 py-8 animate__animated animate__fadeIn'>No recipes found. Create one to get started!</p>";
            return;
        }

        querySnapshot.forEach((doc, index) => {
            const recipe = doc.data();
            const avgRating = recipe.feedback ?
                (recipe.feedback.reduce((acc, curr) => acc + curr.rating, 0) / recipe.feedback.length).toFixed(1) : '0.0';

            const recipeCard = document.createElement("div");
            recipeCard.classList.add(
                "recipe-card", "bg-white", "rounded-lg", "shadow-md",
                "staggered-appear", "overflow-hidden"
            );
            recipeCard.style.setProperty('--card-index', index);

            recipeCard.innerHTML = `
                <div class="recipe-image-container">
                    <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.name}" class="w-full h-48 object-cover recipe-image"/>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-2 text-gray-800">${recipe.name}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${recipe.description.length > 100 ? recipe.description.substring(0, 100) + "..." : recipe.description}</p>
                    <div class="flex flex-wrap mb-3">
                        <span class="recipe-badge bg-yellow-100 text-yellow-800">${recipe.category || 'Uncategorized'}</span>

                    </div>
                    <div class="flex justify-between pt-2">
                    <button onclick="console.log('Button clicked'); if(typeof viewRecipe === 'function') { viewRecipe('${doc.id}'); } else { console.error('viewRecipe function not found'); }" class="btn-action bg-yellow-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 transform hover:scale-105">View</button>
                        <button onclick="editRecipe('${doc.id}')" class="btn-action bg-yellow-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 transform hover:scale-105">Edit</button>
                        <button onclick="deleteRecipe('${doc.id}')" class="btn-action bg-yellow-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 transform hover:scale-105">Delete</button>
                    </div>
                </div>
            `;
            recipesContainer.appendChild(recipeCard);
        });


        setTimeout(() => {
            const staggeredCards = document.querySelectorAll('.staggered-appear');
            staggeredCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('card-appear');
                }, 100 * index);
            });
        }, 300);

    } catch (error) {
        console.error("Error fetching recipes:", error);
        Swal.fire('Error', 'Failed to load recipes: ' + error.message, 'error');
    }
}
window.viewRecipe = function(recipeId) {
    window.location.href = `recipe-detail.html?id=${recipeId}`;
};

window.editRecipe = async function(recipeId) {
    try {
        const docRef = doc(db, 'recipes', recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const recipe = docSnap.data();
            document.getElementById('recipeId').value = recipeId;
            document.getElementById('recipeName').value = recipe.name;
            document.getElementById('recipeDescription').value = recipe.description;
            document.getElementById('recipeIngredients').value = recipe.ingredients;
            document.getElementById('recipeInstructions').value = recipe.instructions;
            document.getElementById('recipeImage').value = recipe.image;
            document.getElementById('recipeVideo').value = recipe.video;

            if (document.getElementById('recipeCategory')) {
                document.getElementById('recipeCategory').value = recipe.category || 'Uncategorized';
            }

            showEditModal();
        }
    } catch (error) {
        console.error("Error getting recipe:", error);
        Swal.fire('Error', 'Failed to load recipe: ' + error.message, 'error');
    }
};

function addCategoryDropdownToEditForm() {
    if (!document.getElementById('recipeCategory')) {
        // Create the category dropdown
        const categoryDropdown = document.createElement('div');
        categoryDropdown.className = 'form-group mb-3';
        categoryDropdown.innerHTML = `
            <label for="recipeCategory" class="block text-gray-700 font-semibold mb-2">Category</label>
            <select id="recipeCategory" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all">

                    <select id="recipeCategory" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                        <option value="" disabled selected>Select Category</option>
                        <option value="beverages">Beverages</option>
                        <option value="biryani">Biryani</option>
                        <option value="pizza">Pizza</option>
                        <option value="burger">Burger</option>
                        <option value="desserts">Desserts</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="pasta">Pasta</option>
                        <option value="others">Others</option>

            </select>
        `;
        const form = document.getElementById('editRecipeForm');
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton && submitButton.parentElement) {
            form.insertBefore(categoryDropdown, submitButton.parentElement);
        } else {
            form.appendChild(categoryDropdown);
        }
    }
}
window.editRecipe = async function(recipeId) {
    try {
        const docRef = doc(db, 'recipes', recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const recipe = docSnap.data();
            document.getElementById('recipeId').value = recipeId;
            document.getElementById('recipeName').value = recipe.name;
            document.getElementById('recipeDescription').value = recipe.description;
            document.getElementById('recipeIngredients').value = recipe.ingredients;
            document.getElementById('recipeInstructions').value = recipe.instructions;
            document.getElementById('recipeImage').value = recipe.image;
            document.getElementById('recipeVideo').value = recipe.video;
            showEditModal();
            addCategoryDropdownToEditForm();
            setTimeout(() => {
                const categoryDropdown = document.getElementById('recipeCategory');
                if (categoryDropdown) {
                    const validCategories = ['beverages', 'biryani', 'pizza', 'burger', 'dessert', 'breakfast', 'pasta', 'others'];
                    if (recipe.category && validCategories.includes(recipe.category)) {
                        categoryDropdown.value = recipe.category;
                    } else {
                        categoryDropdown.value = 'Uncategorized';
                    }
                }
            }, 100);
        }
    } catch (error) {
        console.error("Error getting recipe:", error);
        Swal.fire('Error', 'Failed to load recipe: ' + error.message, 'error');
    }
};
document.getElementById('editRecipeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const recipeId = document.getElementById('recipeId').value;
    const user = auth.currentUser;
    Swal.fire({
        title: 'Saving...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    const categoryElement = document.getElementById('recipeCategory');
    const category = categoryElement ? categoryElement.value : 'Uncategorized';

    const updatedRecipe = {
        name: document.getElementById('recipeName').value,
        description: document.getElementById('recipeDescription').value,
        ingredients: document.getElementById('recipeIngredients').value,
        instructions: document.getElementById('recipeInstructions').value,
        image: document.getElementById('recipeImage').value || '/api/placeholder/300/200',
        video: document.getElementById('recipeVideo').value || '',
        category: category,
        user: user ? { email: user.email, uid: user.uid } : {},
        updatedAt: serverTimestamp()
    };

    try {
        const recipeRef = doc(db, 'recipes', recipeId);
        await updateDoc(recipeRef, updatedRecipe);
        Swal.fire({
            title: 'Success!',
            text: 'Recipe updated successfully!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        window.closeEditModal();
        loadUserRecipes(user.uid);
    } catch (error) {
        Swal.fire('Error', 'Failed to update recipe: ' + error.message, 'error');
    }
});

window.showEditModal = function() {
    const modal = document.getElementById('editRecipeModal');
    modal.style.display = 'flex';
    modal.classList.add('animate__animated', 'animate__fadeIn');
};

window.closeEditModal = function() {
    const modal = document.getElementById('editRecipeModal');
    modal.classList.add('animate__animated', 'animate__fadeOut');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('animate__animated', 'animate__fadeOut');
    }, 300);
};

document.getElementById('editRecipeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const recipeId = document.getElementById('recipeId').value;
    const user = auth.currentUser;
    Swal.fire({
        title: 'Saving...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const updatedRecipe = {
        name: document.getElementById('recipeName').value,
        description: document.getElementById('recipeDescription').value,
        ingredients: document.getElementById('recipeIngredients').value,
        instructions: document.getElementById('recipeInstructions').value,
        image: document.getElementById('recipeImage').value || '/api/placeholder/300/200',
        video: document.getElementById('recipeVideo').value || '',
        category: document.getElementById('recipeCategory')?.value || 'Uncategorized',
        user: user ? { email: user.email, uid: user.uid } : {},
        updatedAt: serverTimestamp()
    };

    try {
        const recipeRef = doc(db, 'recipes', recipeId);
        await updateDoc(recipeRef, updatedRecipe);
        Swal.fire({
            title: 'Success!',
            text: 'Recipe updated successfully!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        window.closeEditModal();
        loadUserRecipes(user.uid);
    } catch (error) {
        Swal.fire('Error', 'Failed to update recipe: ' + error.message, 'error');
    }
});

window.deleteRecipe = async function(recipeId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to recover this recipe!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f87171',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: 'btn-action',
            cancelButton: 'btn-action'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const recipeRef = doc(db, 'recipes', recipeId);
                await deleteDoc(recipeRef);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your recipe has been deleted.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
                loadUserRecipes(auth.currentUser.uid);
            } catch (error) {
                Swal.fire('Error', 'Failed to delete recipe: ' + error.message, 'error');
            }
        }
    });
};

window.logout = async function() {
    Swal.fire({
        title: 'Logout Confirmation',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f87171',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, logout!',
        cancelButtonText: 'Cancel',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await signOut(auth);
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    confirmButtonColor: '#f87171',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'index.html';
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to logout: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#f87171'
                });
            }
        }
    });
};
function goBack() {
    window.location.href = "yum.html";
}

// Function to create shimmer loading cards - disabled
function createShimmerCards() {
    console.log('Shimmer cards disabled - using simple text loader');
    return;
}
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loader
    const loader = document.getElementById('loader');
    const recipesContainer = document.getElementById('recipesContainer');

    // Make sure loader is visible and recipes are hidden initially
    if (loader) {
        loader.style.display = 'flex';
        console.log('Loader should be visible now');
    } else {
        console.error('Loader element not found!');
    }

    if (recipesContainer) {
        recipesContainer.classList.add('hidden');
    }

    // Setup back button
    const backButton = document.querySelector('.back-btn');
    if (backButton) {
        backButton.style.display = "inline-block";
        backButton.style.visibility = "visible";
        backButton.style.opacity = "1";
        backButton.style.backgroundColor = "#ca8a04";
        backButton.addEventListener('click', function(event) {
            event.preventDefault();
            goBack();
        });
    } else {
        console.error("Back button not found in the DOM");
    }
});
