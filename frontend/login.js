const handleLogin = async (event) => {
    event.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const res = await fetch('https://test-thto.onrender.com/patient/login/', {
        method: 'POST',
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password })
    })

    const data = await res.json()
    if (data.token && data.user_id) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user_id', data.user_id)
        window.location.href="index.html"
    }
    console.log(data);

}
