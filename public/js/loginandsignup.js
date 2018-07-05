function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (document.getElementById('password').value != document.getElementById('confirm_password').value) {
        document.getElementById('password-label').innerHTML = 'Enter a password ❌';
        document.getElementById('confirm_password-label').innerHTML = 'Confirm the password ❌';
        return;
    }

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/signup", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ email: email, password: password }));

    // on success or failure
    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            if (response.success === true) {
                // log in on success
                window.location.replace('/dashboard');
            }
        }
    };
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ email: email, password: password }));

    // on success or failure
    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            if (response.success) {
                // log in on success
                window.location.replace("/dashboard");
            }
        }
    };
}