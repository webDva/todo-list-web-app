//
// Initializations
//

let todosLocalStorage;
document.getElementById("add-todo-button").addEventListener('click', addTodo);

/*
* For todo list functionality
*/

function createNewTodoElement(todoText) {
    let listItem = document.createElement("li");
    listItem.className = "todo-listitem";
    
    let deleteButton = document.createElement("button");
    let label = document.createElement("label");

    deleteButton.innerText = "Cross off";
    deleteButton.className = "delete-button";

    label.innerText = todoText;
    label.className = "todo-label-text";

    listItem.appendChild(deleteButton);
    listItem.appendChild(label);

    return listItem;
}

function addTodo() {
    let listItem = createNewTodoElement(document.getElementById("new-todo").value);
    document.getElementById("list-of-todos").appendChild(listItem);
    let deleteButton = listItem.querySelector('button.delete-button');
    deleteButton.onclick = completeTodo;
    document.getElementById("new-todo").value = '';

    // add to localStorage
    todosLocalStorage.push(listItem.querySelector('label').innerText);
    localStorage.setItem('todos', JSON.stringify(todosLocalStorage));
}

function completeTodo() {
    let listItem = this.parentNode;
    listItem.querySelector('label').style.textDecoration = 'line-through';
    listItem.querySelector('button.delete-button').innerText = '✔️';

    // remove from localStorage
    todosLocalStorage.splice(todosLocalStorage.indexOf(listItem.querySelector('label').innerText), 1);
    localStorage.setItem('todos', JSON.stringify(todosLocalStorage));
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

/*
* Local storage
*/

function initializeLocalStorage() {
    if (storageAvailable('localStorage')) {
        // localStorage is available
      }
      else {
        // localStorage is not available
    }

    if (localStorage.getItem('todos')) {
        todosLocalStorage = JSON.parse(localStorage.getItem('todos'));
    } else {
        todosLocalStorage = [];
    }
    
    localStorage.setItem('todos', JSON.stringify(todosLocalStorage));
}

function populateUsingLocalStorage() {
    JSON.parse(localStorage.getItem('todos')).forEach(todo => {
        let listItem = createNewTodoElement(todo);
        document.getElementById("list-of-todos").appendChild(listItem);
        let deleteButton = listItem.querySelector('button.delete-button');
        deleteButton.onclick = completeTodo;
    });    
}

function storageAvailable(type) {
    try {
        let storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

//
// server communication functions
//

function retrieveInitialDisplay() {
    // first check to see if the user's to-dos are in the server's database
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/retrieveTodos', true);
    xhr.send();
    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            // if the server has no to-dos but there are some in localStorage, populate the server's database with the to-dos from localStorage
            if (!response.todos) return;
            if (response.todos.length === 0 && localStorage.getItem('todos')) {
                pushLocalStorageToServer();
                initializeLocalStorage();
                populateUsingLocalStorage();
            } else {
                // save the server's response of to-dos to localStorage
                localStorage.setItem('todos', JSON.stringify(response.todos));
                // now populate the display
                initializeLocalStorage();
                populateUsingLocalStorage();
            }
        }
    };
}

function pushLocalStorageToServer() {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/pushLocalStorage', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ todos: JSON.parse(localStorage.getItem('todos')) }));
}

//
// logout functionality
//

function logout() {
    // clear localStorage to prevent the user from being confused
    localStorage.removeItem('todos');

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/logout", true);
    xhr.send();

    window.location.replace("/");
}