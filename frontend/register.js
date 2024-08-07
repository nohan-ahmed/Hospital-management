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
    document.getElementById('error').innerText = ''

    if (result.message == true) {

        fetch("https://testing-8az5.onrender.com/patient/register/", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(info),
        })
            .then((res) => res.json())
            .then((data) => console.log(data));

    } else {
        document.getElementById('error').innerText = result.message
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
