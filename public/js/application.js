/*
* For todo list functionality
*/

const todoInput = document.getElementById("new-todo");
const addButton = document.getElementById("add-todo-button");
const listOfTodos = document.getElementById("list-of-todos");

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
    let listItem = createNewTodoElement(todoInput.value);
    listOfTodos.appendChild(listItem);
    let deleteButton = listItem.querySelector('button.delete-button');
    deleteButton.onclick = completeTodo;
    todoInput.value = '';

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

addButton.addEventListener('click', addTodo);

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

let todosLocalStorage;

if (localStorage.getItem('todos')) {
    todosLocalStorage = JSON.parse(localStorage.getItem('todos'));
} else {
    todosLocalStorage = [];
}

localStorage.setItem('todos', JSON.stringify(todosLocalStorage));
const dataFromLocalStorage = JSON.parse(localStorage.getItem('todos'));


dataFromLocalStorage.forEach(todo => {
    let listItem = createNewTodoElement(todo);
    listOfTodos.appendChild(listItem);
    let deleteButton = listItem.querySelector('button.delete-button');
    deleteButton.onclick = completeTodo;
});

if (storageAvailable('localStorage')) {
    // localStorage is available
  }
  else {
    // localStorage is not available
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
// logout functionality
//

function logout() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "/logout", true);
    xhr.send();

    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            if (response.success) {
                window.location.replace("/");
            }
        }
    };
}