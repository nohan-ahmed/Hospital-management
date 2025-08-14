// Get API base URL from meta tag
let API_BASE;
try {
    // Check if API_BASE is already defined in the global scope
    if (typeof window.API_BASE === 'undefined') {
        API_BASE = document.querySelector('meta[name="api-base"]')?.content?.replace(/\/$/, '') || 'https://hospital-management-gp1l.onrender.com';
        window.API_BASE = API_BASE; // Store in window object for global access
    } else {
        API_BASE = window.API_BASE; // Use the existing global variable
    }
    console.log('DocDetails using API_BASE:', API_BASE);
} catch (error) {
    console.error('Error setting API_BASE:', error);
    API_BASE = 'https://hospital-management-gp1l.onrender.com'; // Fallback
}

const getParams = () => {
    return new URLSearchParams(window.location.search).get('doctorId');
};

const loadDoctor = async () => {
    try {
        const parent = document.getElementById('doc-info');
        parent.innerHTML = `<div class="flex justify-center"><div class="animate-pulse w-16 h-16 rounded-full bg-gray-300"></div></div>`;
        
        // Use the API client if available, otherwise fall back to fetch
        let data;
        if (window.App?.api) {
            data = await window.App.api.get(`/doctors/${getParams()}`);
        } else {
            const res = await fetch(`${API_BASE}/doctors/${getParams()}`, {
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 credentials: 'same-origin' // Changed from 'include' to 'same-origin' to avoid CORS issues
            });
            if (!res.ok) throw new Error('Failed to fetch doctor details');
            data = await res.json();
        }

        parent.innerHTML = `
            <div class="flex flex-col md:flex-row gap-8">
                <div class="md:w-1/3 flex justify-center">
                    <img src="${data.profile || 'img/default-doctor.png'}" alt="Doctor Image" class="w-64 h-64 object-cover rounded-full shadow-lg" />
                </div>
                <div class="md:w-2/3">
                    <h2 class="text-3xl font-bold text-primary mb-3">Dr. ${data.user}</h2>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${(data.specialisation || []).map(item => `<span class="badge badge-primary badge-outline">${item}</span>`).join('')}
                    </div>
                    <h5 class="text-xl font-semibold text-gray-700 mb-3">${(data.designation || []).join(', ')}</h5>
                    <p class="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam imperdiet facilisis enim.</p>
                    <h4 class="text-2xl font-bold text-primary mb-6">Fees: ${data.fee} BDT</h4>
                    <button type="button" class="btn btn-primary appointment text-white appointment-btn">
                        <i class="fas fa-calendar-check mr-2"></i> Take Appointment
                    </button>
                    <div class="login-prompt mt-4" style="display: none;">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            You need to <a href="./login.html" class="font-bold underline">login</a> to book an appointment
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading doctor:', error);
        const parent = document.getElementById('doc-info');
        parent.innerHTML = `<div class="alert alert-error">Failed to load doctor information. Please try again later.</div>`;
    }
};

const loadReviews = async () => {
    try {
        const parent = document.getElementById('reviews-container');
        parent.innerHTML = `
            <div class="col-span-full flex justify-center">
                <div class="animate-pulse flex space-x-4">
                    <div class="rounded-full bg-gray-300 h-10 w-10"></div>
                    <div class="flex-1 space-y-2 py-1">
                        <div class="h-2 bg-gray-300 rounded"></div>
                        <div class="h-2 bg-gray-300 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Use the API client if available, otherwise fall back to fetch
        let data;
        if (window.App?.api) {
            data = await window.App.api.get(`/reviews/?doctor=${getParams()}`);
        } else {
            const res = await fetch(`${API_BASE}/reviews/?doctor=${getParams()}`, {
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 credentials: 'same-origin' // Changed from 'include' to 'same-origin' to avoid CORS issues
            });
            if (!res.ok) throw new Error('Failed to fetch reviews');
            data = await res.json();
        }
        parent.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            parent.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-gray-500">
                        <i class="fas fa-comment-slash text-4xl mb-3"></i>
                        <p>No reviews yet. Be the first to leave a review!</p>
                    </div>
                </div>
            `;
            return;
        }

        (data.results || []).forEach(review => {
            const div = document.createElement('div');
            div.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1';
            div.innerHTML = `
                <div class="bg-primary h-3"></div>
                <div class="p-6">
                    <div class="flex items-center mb-4">
                        <img src="img/reviewer.png" class="w-12 h-12 rounded-full mr-4" alt="Reviewer" />
                        <div>
                            <h4 class="font-bold text-lg">${review.reviwer || "Anonymous"}</h4>
                            <div class="flex text-yellow-400">
                                ${generateStarRating(review.rating || 5)}
                            </div>
                        </div>
                    </div>
                    <div class="border-t pt-4">
                        <h5 class="font-semibold text-lg mb-2">"An amazing service"</h5>
                        <p class="text-gray-600">
                            <i class="fas fa-quote-left text-gray-400 mr-2"></i>${review.body?.slice(0, 105) || "Great experience with the doctor"}...
                        </p>
                    </div>
                </div>
            `;
            parent.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        const parent = document.getElementById('reviews-container');
        parent.innerHTML = `<div class="col-span-full"><div class="alert alert-error">Failed to load reviews. Please try again later.</div></div>`;
    }
};

const generateStarRating = (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
};

const getTimes = async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/available-time/?id=${id}`);
    const data = await res.json();
    return data[0]; // Assuming each request returns an array with one item
};

const loadTime = async () => {
    try {
        const parent = document.getElementById('select_time');
        parent.innerHTML = '<option disabled selected>Loading available times...</option>';
        
        const res = await fetch(`http://127.0.0.1:8000/doctors/${getParams()}`);
        const data = await res.json();

        parent.innerHTML = '<option disabled selected>Select Time</option>';

        const timeList = data.available_time || [];
        
        if (timeList.length === 0) {
            parent.innerHTML = '<option disabled selected>No available time slots</option>';
            return;
        }
        
        for (const timeId of timeList) {
            try {
                const timeObj = await getTimes(timeId);
                const option = document.createElement('option');
                option.value = timeId;
                option.innerText = timeObj.time;
                parent.appendChild(option);
            } catch (error) {
                console.error(`Error loading time slot ${timeId}:`, error);
            }
        }
    } catch (error) {
        console.error('Error loading time slots:', error);
        const parent = document.getElementById('select_time');
        parent.innerHTML = '<option disabled selected>Failed to load time slots</option>';
    }
};

const appointment = async () => {
    // Add event listeners to appointment buttons
    const appointmentButtons = document.querySelectorAll('.appointment-btn');
    appointmentButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Check if user is authenticated before proceeding
            if (!isAuthenticated()) {
                // Show login prompt instead of opening modal
                document.querySelectorAll('.login-prompt').forEach(prompt => {
                    prompt.style.display = 'block';
                });
                return;
            }
            
            // If authenticated, open the appointment modal
            document.getElementById('appointment-modal').classList.add('modal-open');
        });
    });
    
    document.getElementById('submite-appointment').addEventListener('click', async () => {
        try {
            // Show loading state
            const submitBtn = document.getElementById('submite-appointment');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';
            submitBtn.disabled = true;
            
            const status = document.getElementsByName("status");
            const selected = Array.from(status).find((btn) => btn.checked);
            const symptom = document.getElementById("symptom").value;
            const time = document.getElementById("select_time");
            const selectedTime = time.options[time.selectedIndex];

            const token = localStorage.getItem("access");

            if (!token) {
                // Create a toast notification for error
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="error-toast" class="toast toast-top toast-center">
                        <div class="alert alert-error">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            <span>Please log in first to book an appointment.</span>
                        </div>
                    </div>
                `);
                setTimeout(() => {
                    document.getElementById('error-toast')?.remove();
                    window.location.href = "login.html";
                }, 3000);
                return;
            }

            if (!selectedTime || !selectedTime.value) {
                // Create a toast notification for error
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="error-toast" class="toast toast-top toast-center">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <span>Please select a time slot.</span>
                        </div>
                    </div>
                `);
                setTimeout(() => document.getElementById('error-toast')?.remove(), 3000);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }
            
            if (!symptom.trim()) {
                // Create a toast notification for error
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="error-toast" class="toast toast-top toast-center">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <span>Please describe your symptoms.</span>
                        </div>
                    </div>
                `);
                setTimeout(() => document.getElementById('error-toast')?.remove(), 3000);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            const info = {
                appointment_type: selected?.value || 'Physical',
                appointment_status: "Pending",
                time: selectedTime.value,
                symptoms: symptom,
                cancel: false,
                doctor: getParams(),
            };

            const res = await fetch('http://127.0.0.1:8000/appointments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(info),
            });

            const data = await res.json();
            console.log("Appointment response:", data);

            if (res.ok) {
                // Create a toast notification for success
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="success-toast" class="toast toast-top toast-center">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle mr-2"></i>
                            <span>Appointment submitted successfully!</span>
                        </div>
                    </div>
                `);
                setTimeout(() => {
                    document.getElementById('success-toast')?.remove();
                    location.reload();
                }, 2000);
            } else {
                // Create a toast notification for error
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="error-toast" class="toast toast-top toast-center">
                        <div class="alert alert-error">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            <span>${data.detail || 'Failed to submit appointment. Please try again.'}</span>
                        </div>
                    </div>
                `);
                setTimeout(() => document.getElementById('error-toast')?.remove(), 3000);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error submitting appointment:', error);
            // Create a toast notification for error
            document.body.insertAdjacentHTML('beforeend', `
                <div id="error-toast" class="toast toast-top toast-center">
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span>An unexpected error occurred. Please try again later.</span>
                    </div>
                </div>
            `);
            setTimeout(() => document.getElementById('error-toast')?.remove(), 3000);
            
            const submitBtn = document.getElementById('submite-appointment');
            submitBtn.innerHTML = '<i class="fas fa-calendar-check mr-2"></i> Submit';
            submitBtn.disabled = false;
        }
    });
};

async function main() {
    try {
        // Show page loading state
        document.getElementById('doc-info').innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
        `;
        document.getElementById('reviews-container').innerHTML = `
            <div class="flex justify-center items-center min-h-[200px]">
                <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
        `;
        
        // Initialize all components
        await loadDoctor();
        await loadReviews();
        await loadTime();
        await appointment();
        
        // Initialize tooltips and other UI components if needed
        document.querySelectorAll('[data-tooltip-target]').forEach(el => {
            // Initialize any custom UI components here
        });
    } catch (error) {
        console.error('Error initializing page:', error);
        document.getElementById('doc-info').innerHTML = `
            <div class="alert alert-error shadow-lg my-5">
                <div>
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Failed to load doctor information. Please try refreshing the page.</span>
                </div>
            </div>
        `;
    }
}

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
    
    // Update appointment buttons
    const appointmentButtons = document.querySelectorAll('.appointment-btn');
    const loginPrompts = document.querySelectorAll('.login-prompt');
    
    if (authenticated) {
        appointmentButtons.forEach(btn => {
            btn.style.display = 'inline-flex';
        });
        loginPrompts.forEach(prompt => {
            prompt.style.display = 'none';
        });
    } else {
        appointmentButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        loginPrompts.forEach(prompt => {
            prompt.style.display = 'block';
        });
    }
};

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    main();
    updateAuthUI();
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
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
});

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadDoctor,
        loadReviews,
        getTimes,
        loadTime,
        appointment,
        main,
        isAuthenticated,
        updateAuthUI
    };
}

// Remove this duplicate call as it's now handled by the DOMContentLoaded event
// main();
