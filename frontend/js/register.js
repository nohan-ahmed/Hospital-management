const BASE_URL = 'https://hospital-management-gp1l.onrender.com';

        document.addEventListener('DOMContentLoaded', function () {
            const registrationForm = document.getElementById('registration-form');
            const errorMessage = document.getElementById('error-message');
            const errorText = document.getElementById('error');

            registrationForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const firstName = document.getElementById('first_name').value;
                const lastName = document.getElementById('last_name').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                // Basic validation
                if (password !== confirmPassword) {
                    errorText.textContent = 'Passwords do not match';
                    errorMessage.classList.remove('hidden');
                    return;
                }

                try {
                    const response = await fetch(`${BASE_URL}/api/user/register/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username,
                            first_name: firstName,
                            last_name: lastName,
                            email,
                            password,
                            confirm_password: confirmPassword
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Registration successful, redirect to login page
                        window.location.href = 'login.html';
                    } else {
                        // Show error message
                        errorText.textContent = data.message || 'Registration failed. Please try again.';
                        errorMessage.classList.remove('hidden');
                        console.error('Registration failed:', data);
                    }
                } catch (error) {
                    console.error('Error during registration:', error);
                    errorText.textContent = 'An error occurred. Please try again later.';
                    errorMessage.classList.remove('hidden');
                }
            });
        });