function signUp() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (document.getElementById('password').value != document.getElementById('confirm_password').value) {
        document.getElementById('password-label').innerHTML = 'Create a new password ❌';
        document.getElementById('confirm_password-label').innerHTML = 'Confirm the password ❌';
        return;
    }

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/signup", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ username: username, password: password }));

    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            if (response.success) {
                // log in on success
                window.location.replace('/todos');
            } else {
                document.getElementById('username-label').innerHTML = 'Username already exists ❌';
            }
        }
    };
}

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ username: username, password: password }));

    // on success or failure
    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            if (response.success) {
                // log in on success
                window.location.replace("/todos");
            } else {
                document.getElementById('username-label').innerHTML = 'Username ❌';
                document.getElementById('password-label').innerHTML = 'Password ❌';
            }
        }
    };
}