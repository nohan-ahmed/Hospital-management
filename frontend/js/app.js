// Get API base URL from meta tag or window object if already defined
// Use var instead of let to avoid redeclaration issues when multiple scripts use this variable
var API_BASE;
if (typeof window.API_BASE !== 'undefined') {
    // Use the existing global variable if already defined (likely by login.js)
    API_BASE = window.API_BASE;
    console.log('App.js using existing API_BASE:', API_BASE);
} else {
    try {
        API_BASE = document.querySelector('meta[name="api-base"]')?.content?.replace(/\/$/, '') || 'https://hospital-management-gp1l.onrender.com';
        window.API_BASE = API_BASE; // Store in window object for global access
        console.log('App.js setting API_BASE:', API_BASE);
    } catch (error) {
        console.error('Error setting API_BASE:', error);
        API_BASE = 'https://hospital-management-gp1l.onrender.com'; // Fallback
    }
}

const BASE_URL = API_BASE; // For backward compatibility

const loadServices = async () => {
    try {
        const response = await fetch(`${BASE_URL}/services/`, {
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to load services. Status: ${response.status}`);

        const data = await response.json();
        console.log("Services data:", data);

        const parent = document.getElementById('slider-container');
        parent.innerHTML = ''; // Clear existing content

        // Show loading state if needed
        if (data.length === 0) {
            parent.innerHTML = `
                <div class="col-span-3 text-center py-10">
                    <p class="text-gray-500">No services available at the moment.</p>
                </div>
            `;
            return;
        }

        data.forEach(element => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'card bg-base-100 shadow-xl h-full flex flex-col';

            serviceCard.innerHTML = `
                <figure class="px-4 pt-4">
                    <img src="${element.image || 'img/service.png'}" alt="${element.name}" class="rounded-xl object-cover h-48 w-full" />
                </figure>
                <div class="card-body service-body flex flex-col flex-1">
                    <h3 class="card-title text-primary service-title">${element.name}</h3>
                    <p class="flex-grow">${(element.description || '').slice(0, 100)}...</p>
                    <div class="card-actions justify-end mt-auto">
                        <a href="#" class="inline-flex items-center text-primary hover:text-primary-focus" onclick="event.preventDefault()">
                            Learn more 
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            `;

            parent.appendChild(serviceCard);
        });

    } catch (error) {
        console.error("Error loading services:", error);
        const parent = document.getElementById('slider-container');
        parent.innerHTML = `
            <div class="col-span-3 text-center py-10">
                <p class="text-red-500">Failed to load services. Please try again later.</p>
            </div>
        `;
    }
};

// Function to load designations and specialisations for filter buttons
const loadFilterOptions = async () => {
    try {
        // Fetch designations
        const designationsResponse = await fetch(`${BASE_URL}/designations/`, {
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
        });

        // Fetch specialisations
        const specialisationsResponse = await fetch(`${BASE_URL}/specialisations/`, {
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!designationsResponse.ok || !specialisationsResponse.ok) {
            throw new Error('Failed to load filter options');
        }

        const designations = await designationsResponse.json();
        const specialisations = await specialisationsResponse.json();

        console.log('Designations:', designations);
        console.log('Specialisations:', specialisations);

        // Get the filter buttons container
        const filterContainer = document.querySelector('.doctors-filter-container');
        if (filterContainer) {
            // Clear existing buttons except the 'All' button
            filterContainer.innerHTML = '<button class="btn btn-outline btn-primary" onclick="loadDoctors(\'\', \'\')">' + 'All' + '</button>';

            // Add designation buttons (limited to 3 for space)
            designations.slice(0, 3).forEach(designation => {
                const button = document.createElement('button');
                button.className = 'btn btn-outline';
                button.textContent = designation.name;
                button.onclick = () => loadDoctors(designation.id, 'designation');
                filterContainer.appendChild(button);
            });

            // Add specialisation buttons (limited to 3 for space)
            specialisations.slice(0, 3).forEach(specialisation => {
                const button = document.createElement('button');
                button.className = 'btn btn-outline';
                button.textContent = specialisation.name;
                button.onclick = () => loadDoctors(specialisation.id, 'specialisation');
                filterContainer.appendChild(button);
            });
        }
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
};

const loadDoctors = async (id, cat = '') => {
    console.log('Loading doctors with filter:', cat, id);

    try {
        // Construct URL properly based on whether we have filter parameters
        let url = `${BASE_URL}/doctors/`;
        if (id && cat) {
            url += `?${cat}=${id}`;
        }
        console.log('Fetching from URL:', url);

        const response = await fetch(url, {
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to load doctors. Status: ${response.status}`);

        const data = await response.json();
        console.log("Doctors data:", data);

        const parent = document.getElementById('doctors-container');
        const no_data = document.getElementById('no-data');
        parent.innerHTML = '';

        if (data.results && data.results.length > 0) {
            no_data.classList.add('hidden');

            data.results.forEach(doctor => {
                // Fallbacks
                const image = doctor.profile || 'img/profile avatar.png';
                const name = doctor.user || 'Unknown Doctor';
                let designation = 'Specialist';

                // Handle designation which could be string, array, or object
                if (doctor.designation) {
                    if (typeof doctor.designation === 'string') {
                        designation = doctor.designation;
                    } else if (Array.isArray(doctor.designation) && doctor.designation.length > 0) {
                        designation = doctor.designation[0];
                    } else if (typeof doctor.designation === 'object' && doctor.designation.name) {
                        designation = doctor.designation.name;
                    }
                }

                const id = doctor.id || '0';

                const doctorCard = document.createElement('div');
                doctorCard.className = 'card bg-base-100 shadow-xl';

                doctorCard.innerHTML = `
                    <a href="docDetails.html?doctorId=${id}" class="h-full">
                        <figure class="px-6 pt-6">
                            <img src="${image}" alt="${name}" class="rounded-full w-32 h-32 object-cover mx-auto" />
                        </figure>
                        <div class="card-body items-center text-center">
                            <h2 class="card-title text-primary">${name}</h2>
                            <p class="text-gray-600 font-medium">${designation}</p>
                            <div class="divider my-2"></div>
                            <p class="text-sm text-gray-500">
                                <i class="fas fa-quote-left mr-2 text-primary opacity-50"></i>
                                Dedicated to providing exceptional patient care with expertise and compassion.
                            </p>
                            <div class="card-actions mt-4">
                                <button class="btn btn-outline btn-primary btn-sm">View Profile</button>
                            </div>
                        </div>
                    </a>
                `;

                parent.appendChild(doctorCard);
            });

        } else {
            no_data.classList.remove('hidden');
        }

    } catch (error) {
        console.error("Error loading doctors:", error);
        const parent = document.getElementById('doctors-container');
        parent.innerHTML = `
            <div class="col-span-4 text-center py-10">
                <p class="text-red-500">Failed to load doctors. Please try again later.</p>
            </div>
        `;
    }
};

// Helper function to create loading animation
const createLoadingAnimation = () => {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading mx-auto my-10';
    loadingDiv.innerHTML = '<div></div><div></div><div></div><div></div>';
    return loadingDiv;
};

// Function to check if user is authenticated
const isAuthenticated = () => {
    // Use TokenStore if available (from login.js)
    if (typeof TokenStore !== 'undefined') {
        const accessToken = TokenStore.get();
        const isExpired = TokenStore.isExpired ? TokenStore.isExpired() : true;
        console.log('Auth check - Token exists:', !!accessToken, 'Is expired:', isExpired);
        return accessToken && !isExpired;
    } else {
        // Fallback to direct localStorage check
        const accessToken = localStorage.getItem('access_token');
        console.log('Auth check (fallback) - Token exists:', !!accessToken);
        return !!accessToken;
    }
};

// Function to update UI based on authentication status
const updateAuthUI = () => {
    const authenticated = isAuthenticated();
    console.log('Updating UI - User authenticated:', authenticated);

    // Get user data
    let user = null;
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            user = JSON.parse(userData);
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }

    // Update navigation
    const loginRegisterNav = document.getElementById('nav-login-register');
    const profileNav = document.getElementById('nav-profile');

    if (authenticated) {
        if (loginRegisterNav) loginRegisterNav.style.display = 'none';
        if (profileNav) profileNav.style.display = 'block';

        // Update user greeting if element exists
        const userGreeting = document.getElementById('user-greeting');
        if (userGreeting && user && user.username) {
            userGreeting.textContent = user.username;
        }

        // Show appointment buttons if they exist
        const appointmentButtons = document.querySelectorAll('.appointment-btn');
        appointmentButtons.forEach(btn => {
            btn.style.display = 'inline-flex';
        });
    } else {
        if (loginRegisterNav) loginRegisterNav.style.display = 'block';
        if (profileNav) profileNav.style.display = 'none';

        // Hide appointment buttons if they exist
        const appointmentButtons = document.querySelectorAll('.appointment-btn');
        appointmentButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }
};

// Function to load testimonials from the API
const loadTestimonials = async () => {
    try {
        const response = await fetch(`${BASE_URL}/reviews/`, {
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Failed to load testimonials. Status: ${response.status}`);

        const data = await response.json();
        console.log("Testimonials data:", data);

        const container = document.getElementById('testimonials-container');
        const noTestimonials = document.getElementById('no-testimonials');

        container.innerHTML = ''; // Clear existing content

        if (data.results && data.results.length > 0) {
            noTestimonials.classList.add('hidden');

            data.results.forEach(review => {
                const testimonialCard = document.createElement('div');
                testimonialCard.className = 'card bg-base-100 shadow-xl';

                // Create star rating based on the rating value (which can be a number or a string with stars)
                let ratingCount = 0;

                if (typeof review.rating === 'number') {
                    // If rating is a number (e.g., 5)
                    ratingCount = review.rating;
                } else if (typeof review.rating === 'string') {
                    // If rating is a string with stars (e.g., "⭐⭐⭐⭐⭐")
                    ratingCount = (review.rating.match(/⭐/g) || []).length;
                }

                let ratingHTML = '';
                for (let i = 1; i <= ratingCount; i++) {
                    ratingHTML += `<input type="radio" name="rating-${review.id}" class="mask mask-star-2 bg-orange-400" ${i <= ratingCount ? 'checked' : ''} disabled />`;
                }

                testimonialCard.innerHTML = `
                    <div class="card-body">
                        <div class="flex items-center mb-4">
                            <div class="avatar">
                                <div class="w-12 rounded-full">
                                    <img src="img/reviewer.png" alt="${review.reviewer || 'Patient'}" />
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="font-semibold">${review.reviewer || 'Anonymous'}</h3>
                                <div class="rating rating-sm">
                                    ${ratingHTML}
                                </div>
                            </div>
                        </div>
                        <p>"${review.body || 'No comment provided.'}"</p>
                        <div class="text-sm text-gray-500 mt-2">
                            <span>Doctor: ${review.doctor_name || 'Unknown'}</span>
                            <span class="ml-4">Date: ${new Date(review.created_on).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;

                container.appendChild(testimonialCard);
            });
        } else {
            noTestimonials.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error loading testimonials:", error);
        const container = document.getElementById('testimonials-container');
        container.innerHTML = `
            <div class="col-span-3 text-center py-10">
                <p class="text-red-500">Failed to load testimonials. Please try again later.</p>
            </div>
        `;
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Update UI based on authentication status
    updateAuthUI();

    // Load filter options for doctors section
    loadFilterOptions();

    // Load initial data
    loadServices();
    loadDoctors('', '');
    loadTestimonials();

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Use TokenStore if available
            if (typeof TokenStore !== 'undefined' && typeof TokenStore.clear === 'function') {
                TokenStore.clear();
            } else {
                // Fallback
                localStorage.removeItem('access_token');
                localStorage.removeItem('token_expiry');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
            }

            // Update UI
            updateAuthUI();

            // Redirect to login page
            window.location.href = 'login.html';
        });
    }

    // Load services and doctors if we're on the homepage
    if (document.getElementById('slider-container')) {
        loadServices();
    }

    if (document.getElementById('doctors-container')) {
        loadDoctors('', '');
    }
});
