function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/signup", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ email: email, password: password }));

    // on success or failure
    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            if (response.success === true) {
                window.location.replace('/');
            } else {
                console.log(this.response);
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
                window.location.replace("/dashboard");
            } else {
                console.log(this.response);
            }
        }
    };
}