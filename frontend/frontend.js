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

/*
* For todo list functionality
*/

const todoInput = document.getElementById("new-todo");
const addButton = document.getElementById("add-todo-button");
const listOfTodos = document.getElementById("list-of-todos");

function createNewTodoElement(todoText) {
    let listItem = document.createElement("li");
    listItem.className = "todo-listitem";
    
    let checkBox = document.createElement("input");
    let label = document.createElement("label");
    let deleteButton = document.createElement("button");
  
    checkBox.type = "checkBox";
    checkBox.className = "input-checkbox-type-1";

    label.innerText = todoText;
    label.className = "todo-label-text";

    deleteButton.innerText = "Remove";
    deleteButton.className = "delete-button";

    listItem.appendChild(checkBox);
    listItem.appendChild(label);
    listItem.appendChild(deleteButton);

    return listItem;
}

function addTodo() {
    let listItem = createNewTodoElement(todoInput.value);
    listOfTodos.appendChild(listItem);
    bindTodoEvents(listItem, todoCompleted);
    todoInput.value = '';
}

function deleteTodo() {
    let listItem = this.parentNode;
    let ul = listItem.parentNode;
    ul.removeChild(listItem);
}

function todoCompleted() {
    let listItem = this.parentNode;
    listItem.querySelector('label').style.textDecoration = 'line-through';
    bindTodoEvents(listItem, todoIncomplete);
}

function todoIncomplete() {
    let listItem = this.parentNode;
    listItem.querySelector('label').style.textDecoration = 'none';
    bindTodoEvents(listItem, todoCompleted);
}

addButton.addEventListener('click', addTodo);

function bindTodoEvents(todoListItem, checkBoxEventHandler) {
    let checkBox = todoListItem.querySelector('input[type="checkbox"]');
    let deleteButton = todoListItem.querySelector('button.delete-button');
    checkBox.onchange = checkBoxEventHandler;
    deleteButton.onclick = deleteTodo;
}

function enterKey(event) {
    if (event.keyCode == 13) {
        addTodo();
        return false;
    } 
    else {
        return true;
    }
}