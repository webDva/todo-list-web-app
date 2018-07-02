function createAccount() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/createAccount", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ email: email, password: password }));

    xhr.onload = function () {
        console.log(this.responseText);
    };
}