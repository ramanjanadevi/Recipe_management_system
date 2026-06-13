import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc
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
const db = getFirestore(app);
const auth = getAuth(app);

// Get recipe ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');
console.log("Recipe ID from URL:", recipeId);

// Initialize feedback variables
let currentUserEmail = '';
let currentRating = 0;
let feedbackBeingEdited = null;

// Check if recipe ID is valid
if (!recipeId) {
    console.error("No recipe ID found in URL");
}

async function fetchRecipeDetails() {
    console.log("Starting fetchRecipeDetails function");
    console.log("Recipe ID:", recipeId);

    // Show a simple loading message
    document.getElementById('recipeDetails').innerHTML = `
        <div style="text-align: center; padding: 20px; margin-top: 20px;">
            <p>Loading recipe details...</p>
        </div>
    `;

    if (!recipeId) {
        console.error("No recipe ID provided");
        document.getElementById('recipeDetails').innerHTML = `
            <div style="text-align: center; padding: 20px; margin-top: 20px; color: #b91c1c;">
                <p>Recipe not found. No recipe ID was provided.</p>
                <p><a href="yum.html" style="color: #693d52; text-decoration: underline;">Return to home page</a></p>
            </div>
        `;
        return;
    }

    try {
        console.log("Attempting to fetch recipe document from Firestore");
        const recipeRef = doc(db, 'recipes', recipeId);
        console.log("Recipe reference:", recipeRef);

        const recipeDoc = await getDoc(recipeRef);
        console.log("Recipe document fetched:", recipeDoc);

        if (recipeDoc.exists()) {
            console.log("Recipe exists, getting data");
            const recipeData = recipeDoc.data();
            console.log("Recipe data:", recipeData);

            // Basic validation of recipe data
            if (!recipeData || !recipeData.name || !recipeData.ingredients || !recipeData.instructions) {
                throw new Error("Recipe data is incomplete");
            }

            try {
                displayRecipeDetails(recipeData);
                loadFeedbacks();
            } catch (displayError) {
                console.error("Error in displayRecipeDetails:", displayError);
                throw displayError;
            }
        } else {
            console.error("Recipe document does not exist");
            document.getElementById('recipeDetails').innerHTML = `
                <div style="text-align: center; padding: 20px; margin-top: 20px; color: #b91c1c;">
                    <p>Recipe not found. The requested recipe does not exist.</p>
                    <p><a href="yum.html" style="color: #693d52; text-decoration: underline;">Return to home page</a></p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error in fetchRecipeDetails:", error);
        document.getElementById('recipeDetails').innerHTML = `
            <div style="text-align: center; padding: 20px; margin-top: 20px; color: #b91c1c;">
                <p>Error loading recipe: ${error.message}</p>
                <p>Please try again later or contact support.</p>
                <p><a href="yum.html" style="color: #693d52; text-decoration: underline;">Return to home page</a></p>
            </div>
        `;
    }
}

function displayRecipeDetails(recipe) {
    console.log("Starting displayRecipeDetails function");

    try {
        // Validate recipe data
        if (!recipe) {
            console.error("Recipe data is null or undefined");
            throw new Error("Recipe data is missing");
        }

        console.log("Recipe object:", recipe);
        console.log("Recipe name:", recipe.name);
        console.log("Recipe ingredients:", typeof recipe.ingredients);
        console.log("Recipe instructions:", typeof recipe.instructions);

        if (!recipe.ingredients || !recipe.instructions) {
            console.error("Recipe is missing required fields");
            throw new Error("Recipe is missing required fields");
        }

        // Format ingredients as list items - with error handling
        let ingredientsList = "";
        try {
            console.log("Processing ingredients:", recipe.ingredients);

            // Check if ingredients is a string
            if (typeof recipe.ingredients !== 'string') {
                console.error("Ingredients is not a string:", typeof recipe.ingredients);

                // Try to convert to string if possible
                if (recipe.ingredients) {
                    recipe.ingredients = String(recipe.ingredients);
                    console.log("Converted ingredients to string:", recipe.ingredients);
                } else {
                    throw new Error("Ingredients is not a valid string");
                }
            }

            // Process ingredients with more robust approach
            const items = recipe.ingredients.split('\n');
            console.log("Split ingredients into items:", items.length);

            const filteredItems = items.filter(item => item && item.trim() !== '');
            console.log("Filtered ingredients items:", filteredItems.length);

            ingredientsList = filteredItems.map(item =>
                `<li class="recipe-ingredient-item">${item.trim()}</li>`
            ).join('');

            console.log("Ingredients list processed successfully");

            // If no ingredients were found, provide a default
            if (!ingredientsList) {
                ingredientsList = "<li>No ingredients listed</li>";
            }
        } catch (error) {
            console.error("Error processing ingredients:", error);
            ingredientsList = "<li>Error loading ingredients</li>";
        }

        // Format instructions as numbered steps - with error handling
        let instructionsList = "";
        try {
            console.log("Processing instructions:", recipe.instructions);

            // Check if instructions is a string
            if (typeof recipe.instructions !== 'string') {
                console.error("Instructions is not a string:", typeof recipe.instructions);

                // Try to convert to string if possible
                if (recipe.instructions) {
                    recipe.instructions = String(recipe.instructions);
                    console.log("Converted instructions to string:", recipe.instructions);
                } else {
                    throw new Error("Instructions is not a valid string");
                }
            }

            // Process instructions with more robust approach
            const steps = recipe.instructions.split('\n');
            console.log("Split instructions into steps:", steps.length);

            const filteredSteps = steps.filter(step => step && step.trim() !== '');
            console.log("Filtered instruction steps:", filteredSteps.length);

            instructionsList = filteredSteps.map(step =>
                `<li class="recipe-instruction-item">${step.trim()}</li>`
            ).join('');

            console.log("Instructions list processed successfully");

            // If no instructions were found, provide a default
            if (!instructionsList) {
                instructionsList = "<li>No instructions listed</li>";
            }
        } catch (error) {
            console.error("Error processing instructions:", error);
            instructionsList = "<li>Error loading instructions</li>";
        }

        // Calculate average rating if available - with error handling
        let avgRating = "0.0";
        try {
            if (recipe.feedback && Array.isArray(recipe.feedback) && recipe.feedback.length > 0) {
                avgRating = (recipe.feedback.reduce((acc, curr) => acc + (curr.rating || 0), 0) / recipe.feedback.length).toFixed(1);
            }
            console.log("Average rating calculated:", avgRating);
        } catch (error) {
            console.error("Error calculating average rating:", error);
            avgRating = "0.0";
        }

        // Format date - with error handling
        let formattedDate = "Unknown date";
        try {
            if (recipe.createdAt && recipe.createdAt.seconds) {
                formattedDate = new Date(recipe.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            console.log("Formatted date:", formattedDate);
        } catch (error) {
            console.error("Error formatting date:", error);
            formattedDate = "Unknown date";
        }

    console.log("Building HTML template");

    try {
        // Create a simpler, more robust template
        const html = `
        <div class="recipe-card">
            <!-- Recipe Header with Image -->
            <div class="recipe-header">
                <img src="${recipe.image || 'https://via.placeholder.com/800x400?text=No+Image+Available'}"
                    alt="${recipe.name || 'Recipe'}" class="recipe-header-image">
                <div class="recipe-header-overlay">
                    <span class="recipe-category">${recipe.category || 'Uncategorized'}</span>
                    <h1 class="recipe-title">${recipe.name || 'Untitled Recipe'}</h1>
                </div>
            </div>

            <!-- Recipe Content -->
            <div class="recipe-content">
                <!-- Description Section -->
                <div class="recipe-section">
                    <h2 class="recipe-section-title">About This Recipe</h2>
                    <p class="recipe-description">${recipe.description || 'No description available.'}</p>
                </div>

                <!-- Ingredients Section -->
                <div class="recipe-section">
                    <h2 class="recipe-section-title">Ingredients</h2>
                    <ul class="recipe-ingredients-list">
                        ${ingredientsList || '<li>No ingredients listed</li>'}
                    </ul>
                </div>

                <!-- Instructions Section -->
                <div class="recipe-section">
                    <h2 class="recipe-section-title">Instructions</h2>
                    <ol class="recipe-instructions-list">
                        ${instructionsList || '<li>No instructions listed</li>'}
                    </ol>
                </div>

                <!-- Video Section (if available) -->
                ${recipe.video ? `
                <div class="recipe-section">
                    <h2 class="recipe-section-title">Video Tutorial</h2>
                    <div class="recipe-video-container">
                        ${recipe.video}
                    </div>
                </div>
                ` : ''}

                <!-- Feedback Section -->
                <div class="recipe-section">
                    <h2 class="recipe-section-title">Feedback & Ratings</h2>

                    <div class="recipe-feedback-form" id="feedbackForm">
                        <div class="rating-container">
                            <span class="rating-label">Your Rating:</span>
                            <div class="stars">
                                <i class="fas fa-star star" data-rating="1"></i>
                                <i class="fas fa-star star" data-rating="2"></i>
                                <i class="fas fa-star star" data-rating="3"></i>
                                <i class="fas fa-star star" data-rating="4"></i>
                                <i class="fas fa-star star" data-rating="5"></i>
                            </div>
                        </div>
                        <textarea id="feedbackText" class="feedback-textarea"
                            rows="3" placeholder="Share your thoughts about this recipe..."></textarea>
                        <div class="feedback-actions">
                            <button id="submitFeedbackBtn" class="submit-feedback-btn">
                                <i class="fas fa-paper-plane"></i> Submit Feedback
                            </button>
                            <button id="cancelEditBtn" class="cancel-edit-btn hidden">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>

                    <div id="feedbacksList" class="recipe-feedbacks-list">
                        <!-- Feedbacks will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
        `;

        console.log("HTML template built successfully");
        document.getElementById('recipeDetails').innerHTML = html;
        console.log("HTML inserted into DOM");
    } catch (error) {
        console.error("Error building or inserting HTML:", error);
        document.getElementById('recipeDetails').innerHTML = `
            <div style="text-align: center; padding: 20px; margin-top: 20px; color: #b91c1c;">
                <p>Error displaying recipe: ${error.message}</p>
                <p><a href="yum.html" style="color: #693d52; text-decoration: underline;">Return to home page</a></p>
            </div>
        `;
    }

    // Add event listeners to stars and buttons (for all users including guests)
    try {
        console.log("Adding event listeners to stars and buttons");

        // Add event listeners to stars
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                currentRating = rating;
                updateStars(rating);
            });
        });

        // Add event listener to submit feedback button
        const submitBtn = document.getElementById('submitFeedbackBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', submitFeedback);
            console.log("Submit feedback button event listener added");
        }

        // Add event listener to cancel edit button
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', cancelEdit);
            console.log("Cancel edit button event listener added");
        }

        console.log("All event listeners added successfully");

        // Update page title with recipe name
        document.title = `${recipe.name || 'Recipe Details'} - Yum Library`;
        console.log("Page title updated");
    } catch (listenerError) {
        console.error("Error adding event listeners:", listenerError);
    }

    } catch (error) {
        console.error("Error displaying recipe details:", error);
        document.getElementById('recipeDetails').innerHTML = `
            <div style="text-align: center; padding: 20px; margin-top: 20px; color: #b91c1c;">
                <p>Error displaying recipe: ${error.message}</p>
                <p>Please try again later or contact support.</p>
                <p><a href="yum.html" style="color: #693d52; text-decoration: underline;">Return to home page</a></p>
            </div>
        `;
    }
}

function updateStars(rating) {
    document.querySelectorAll('.star').forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add('active');
            star.style.color = 'var(--primary-color)';
        } else {
            star.classList.remove('active');
            star.style.color = 'var(--medium-gray)';
        }
    });
}

function submitFeedback() {
    console.log("submitFeedback function called");

    const feedbackText = document.getElementById('feedbackText').value.trim();
    console.log("Feedback text:", feedbackText);
    console.log("Current rating:", currentRating);

    if (!feedbackText || currentRating === 0) {
        console.log("Validation failed: Missing text or rating");

        Swal.fire({
            title: 'Error!',
            text: 'Please provide both a rating and feedback text.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    console.log("Recipe ID for feedback:", recipeId);
    const storageKey = `feedbacks_${recipeId}`;
    console.log("Storage key:", storageKey);

    try {
        const existingData = localStorage.getItem(storageKey) || '[]';
        console.log("Existing feedback data:", existingData);
        const feedbacks = JSON.parse(existingData);
        console.log("Parsed feedbacks:", feedbacks);

        if (feedbackBeingEdited !== null) {
            console.log("Editing existing feedback at index:", feedbackBeingEdited);

            feedbacks[feedbackBeingEdited] = {
                email: currentUserEmail,
                rating: currentRating,
                text: feedbackText,
                date: new Date().toISOString(),
                editedAt: new Date().toISOString()
            };
            console.log("Updated feedback:", feedbacks[feedbackBeingEdited]);

            Swal.fire({
                title: 'Success!',
                text: 'Your feedback has been updated.',
                icon: 'success',
                confirmButtonText: 'Great!'
            });
            feedbackBeingEdited = null;
            document.getElementById('submitFeedbackBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
            document.getElementById('cancelEditBtn').classList.add('hidden');
        } else {
            console.log("Adding new feedback");
            const newFeedback = {
                email: currentUserEmail,
                rating: currentRating,
                text: feedbackText,
                date: new Date().toISOString()
            };
            console.log("New feedback object:", newFeedback);

            feedbacks.push(newFeedback);
            console.log("Updated feedbacks array:", feedbacks);

            Swal.fire({
                title: 'Success!',
                text: 'Your feedback has been submitted.',
                icon: 'success',
                confirmButtonText: 'Great!'
            });
        }

        const dataToStore = JSON.stringify(feedbacks);
        console.log("Storing data in localStorage:", dataToStore);
        localStorage.setItem(storageKey, dataToStore);
        console.log("Data stored successfully");

        document.getElementById('feedbackText').value = '';
        currentRating = 0;
        updateStars(0);
        loadFeedbacks();
    } catch (error) {
        console.error("Error handling feedback:", error);
        Swal.fire({
            title: 'Error!',
            text: 'There was a problem saving your feedback. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function editFeedback(index) {
    const feedbacks = JSON.parse(localStorage.getItem(`feedbacks_${recipeId}`) || '[]');
    const feedback = feedbacks[index];

    // Set the feedback text and rating
    document.getElementById('feedbackText').value = feedback.text;
    currentRating = feedback.rating;
    updateStars(currentRating);
    feedbackBeingEdited = index;

    // Update the submit button text and icon
    const submitBtn = document.getElementById('submitFeedbackBtn');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Feedback';

    // Show the cancel button
    const cancelBtn = document.getElementById('cancelEditBtn');
    cancelBtn.classList.remove('hidden');

    // Scroll to the feedback form
    document.getElementById('feedbackForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteFeedback(index) {
    Swal.fire({
        title: 'Delete Feedback',
        text: 'Are you sure you want to delete this feedback?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const feedbacks = JSON.parse(localStorage.getItem(`feedbacks_${recipeId}`) || '[]');
            feedbacks.splice(index, 1);
            localStorage.setItem(`feedbacks_${recipeId}`, JSON.stringify(feedbacks));
            if (feedbackBeingEdited === index) {
                cancelEdit();
            } else if (feedbackBeingEdited !== null && feedbackBeingEdited > index) {
                feedbackBeingEdited--;
            }
            Swal.fire(
                'Deleted!',
                'Your feedback has been deleted.',
                'success'
            );
            loadFeedbacks();
        }
    });
}

function cancelEdit() {
    // Reset the form state
    feedbackBeingEdited = null;
    document.getElementById('feedbackText').value = '';
    currentRating = 0;
    updateStars(0);

    // Reset the submit button text and icon
    const submitBtn = document.getElementById('submitFeedbackBtn');
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';

    // Hide the cancel button
    const cancelBtn = document.getElementById('cancelEditBtn');
    cancelBtn.classList.add('hidden');
}

function loadFeedbacks() {
    console.log("Loading feedbacks for recipe ID:", recipeId);
    const storageKey = `feedbacks_${recipeId}`;
    console.log("Storage key for loading feedbacks:", storageKey);

    try {
        const existingData = localStorage.getItem(storageKey) || '[]';
        console.log("Existing feedback data from localStorage:", existingData);
        const feedbacks = JSON.parse(existingData);
        console.log("Parsed feedbacks for display:", feedbacks);
        const feedbacksList = document.getElementById('feedbacksList');

    if (feedbacks.length === 0) {
        feedbacksList.innerHTML = `
            <div class="empty-feedback-message">
                <i class="far fa-comment-dots"></i>
                <p>No feedback yet. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }

    feedbacksList.innerHTML = feedbacks.map((feedback, index) => {
        // Format date
        const feedbackDate = new Date(feedback.date);
        const formattedDate = feedbackDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = feedbackDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div class="feedback-user-info">
                        <div class="feedback-user-avatar">
                            ${feedback.email.charAt(0).toUpperCase()}
                        </div>
                        <div class="feedback-user-details">
                            <div class="feedback-user-name">${feedback.email}</div>
                            <div class="feedback-date">
                                ${formattedDate} at ${formattedTime}
                                ${feedback.editedAt ? ' <span class="edited-label">(edited)</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="feedback-rating">
                        ${Array(5).fill().map((_, i) =>
                            `<i class="fas fa-star ${i < feedback.rating ? 'star-filled' : 'star-empty'}"></i>`
                        ).join('')}
                    </div>
                </div>
                <div class="feedback-content">
                    <p>${feedback.text}</p>
                </div>
                ${feedback.email === currentUserEmail ? `
                    <div class="feedback-actions">
                        <button data-index="${index}" class="feedback-edit-btn">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button data-index="${index}" class="feedback-delete-btn">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.feedback-edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            editFeedback(index);
        });
    });

    document.querySelectorAll('.feedback-delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteFeedback(index);
        });
    });

    console.log("Feedback display and event listeners set up successfully");
    } catch (error) {
        console.error("Error loading feedbacks:", error);
        const feedbacksList = document.getElementById('feedbacksList');
        if (feedbacksList) {
            feedbacksList.innerHTML = `
                <div class="error-message" style="color: #b91c1c; text-align: center; padding: 20px;">
                    <p>Error loading feedbacks. Please try refreshing the page.</p>
                </div>
            `;
        }
    }
}

function goBack() {
    window.history.back();
}

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
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        // Handle both regular and anonymous users
        if (user.isAnonymous) {
            currentUserEmail = "guest@example.com";
        } else {
            currentUserEmail = user.email || "unknown@example.com";
        }
        console.log("Current user email:", currentUserEmail);
        fetchRecipeDetails();
    }
});

window.submitFeedback = submitFeedback;
window.editFeedback = editFeedback;
window.deleteFeedback = deleteFeedback;
window.cancelEdit = cancelEdit;
window.goBack = goBack;
window.logout = logout;