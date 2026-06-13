
$(document).ready(function(){
    const carousel = $('.carousel');
    const items = $('.carousel-item');
    const prevBtn = $('.prev-button');
    const nextBtn = $('.next-button');
    let isDragging = false;
    let startPosition;
    let scrollLeft;
    function getItemsToShow() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 4;
    }
    function updateCarousel(direction) {
        const itemWidth = items.first().outerWidth(true);
        const currentScroll = carousel.scrollLeft();
        const scrollAmount = direction === 'next' ? itemWidth : -itemWidth;
        carousel.animate({
            scrollLeft: currentScroll + scrollAmount
        }, 300);
        updateButtonVisibility();
    }
    function updateButtonVisibility() {
        const maxScroll = carousel[0].scrollWidth - carousel[0].clientWidth;
        prevBtn.toggle(carousel.scrollLeft() > 0);
        nextBtn.toggle(carousel.scrollLeft() < maxScroll - 5);
    }
    carousel.on('mousedown touchstart', function(e) {
        isDragging = true;
        carousel.addClass('dragging');
        startPosition = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        scrollLeft = carousel.scrollLeft();
    });
    $(document).on('mousemove touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentPosition = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const walk = (startPosition - currentPosition) * 2;
        carousel.scrollLeft(scrollLeft + walk);
    });
    $(document).on('mouseup touchend', function() {
        isDragging = false;
        carousel.removeClass('dragging');
    });
    nextBtn.click(() => updateCarousel('next'));
    prevBtn.click(() => updateCarousel('prev'));
    carousel.on('scroll', updateButtonVisibility);
    $(window).resize(function() {
        updateButtonVisibility();
    });
    updateButtonVisibility();
});

function navigateToCategory(category) {
    window.location.href = `category-recipes.html?category=${encodeURIComponent(category)}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const signoutBtn = document.getElementById('signout-btn');
    const mobileSignoutBtn = document.getElementById('mobile-signout-btn');

    // Function to close mobile menu
    function closeMobileMenu() {
        mobileMenu.classList.remove('show');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }

    // Mobile menu toggle functionality
    mobileMenuButton.addEventListener('click', function (e) {
        e.preventDefault();
        mobileMenu.classList.toggle('show');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    });

    // Function to handle smooth scrolling to sections
    function smoothScrollToSection(e, targetId) {
        if (targetId === '#' || targetId === '') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Get the navbar height
                const navbarHeight = document.querySelector('nav').offsetHeight;

                // Calculate the target position with offset for navbar
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                // Scroll to the target position
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    // Close mobile menu when clicking on any link inside it
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            closeMobileMenu();

            // Handle smooth scrolling
            const targetId = this.getAttribute('href');
            smoothScrollToSection(e, targetId);
        });
    });

    // Also add smooth scrolling to desktop menu links
    const desktopMenuLinks = document.querySelectorAll('.hidden.md\\:flex.items-center.space-x-8 a');
    desktopMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            smoothScrollToSection(e, targetId);
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu.classList.contains('show') &&
            !mobileMenu.contains(e.target) &&
            !mobileMenuButton.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Handle window resize for mobile menu
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
    });

    // Logout functionality
    function signOut() {
        // Show SweetAlert confirmation dialog
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f4b266',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log me out!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear session data, cookies, or local storage
                localStorage.removeItem('user');
                sessionStorage.clear();

                // Show success message
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been logged out successfully.',
                    icon: 'success',
                    confirmButtonColor: '#f4b266',
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    // Redirect to login page or home page
                    window.location.href = 'index.html'; // Adjust this to your login page
                });
            }
        });
    }

    // Add event listeners to sign-out buttons
    if (signoutBtn) {
        signoutBtn.addEventListener('click', signOut);
    }

    if (mobileSignoutBtn) {
        mobileSignoutBtn.addEventListener('click', function() {
            closeMobileMenu(); // Close the mobile menu first
            signOut(); // Then trigger the logout function
        });
    }
});



