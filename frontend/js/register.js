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
    console.log('Register.js using API_BASE:', API_BASE);
} catch (error) {
    console.error('Error setting API_BASE:', error);
    API_BASE = 'https://hospital-management-gp1l.onrender.com'; // Fallback
}

const handleRagistration = (event) => {
    event.preventDefault()
    const username = document.getElementById('username').value
    const first_name = document.getElementById('first_name').value
    const last_name = document.getElementById('last_name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const confirm_password = document.getElementById('confirm-password').value

    const info = {
        username,
        first_name,
        last_name,
        email,
        password,
        confirm_password,
    };

    const result = validatePassword(password, confirm_password);
    const errorEl = document.getElementById('error');
    errorEl.innerText = '';
    
    if (result.message == true) {
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';
        }

        fetch(`${API_BASE}/patient/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info),
            credentials: 'same-origin', // Changed from 'include' to 'same-origin' to avoid CORS issues
        })
        .then(async (res) => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || 'Registration failed');
            }
            return res.json();
        })
        .then((data) => {
            console.log('Registration successful:', data);
            // If registration returns tokens, store them
            if (data.access) {
                // Use the TokenStore from login.js if available
                if (window.App && window.App.TokenStore) {
                    const exp = window.App.parseJwtExp ? window.App.parseJwtExp(data.access) : null;
                    window.App.TokenStore.set(data.access, exp);
                }
                
                // Store user data if provided
                if (data.user) {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                }
                
                // Redirect to login or dashboard
                window.location.href = '/login.html';
            } else {
                // If no tokens, just redirect to login
                window.location.href = '/login.html';
            }
        })
        .catch((error) => {
            console.error('Registration error:', error);
            errorEl.innerText = error.message || 'Registration failed. Please try again.';
        })
        .finally(() => {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    } else {
        errorEl.innerText = result.message;
    }
}


function validatePassword(password, confirmPassword) {

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        return { valid: false, message: "Passwords do not match." };
    }

    // Regular expression for password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Check if the password matches the criteria
    if (!passwordRegex.test(password)) {
        return { valid: false, message: "Password must be at least 8 characters long and include letters, numbers, and at least one special character." };
    }


    // If both conditions are met
    return { valid: true, message: true };
}
