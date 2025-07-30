const handleLogin = async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('http://127.0.0.1:8000/patients/login/', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (data.access && data.refresh) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);

        // Optional: Get user profile or ID using the access token
        const userRes = await fetch('https://test-thto.onrender.com/patient/me/', {
            headers: {
                Authorization: `Bearer ${data.access}`
            }
        });
        const userData = await userRes.json();
        localStorage.setItem('user_id', userData.id); // or whatever field you want

        window.location.href = "index.html";
    } else {
        alert("Invalid credentials. Please try again.");
    }
}
