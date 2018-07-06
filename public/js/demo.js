document.getElementById("add-todo-button").addEventListener('click', addTodo);

let todosLocalStorage;
if (localStorage.getItem('todos')) {
    todosLocalStorage = JSON.parse(localStorage.getItem('todos'));
} else {
    todosLocalStorage = [];
}
localStorage.setItem('todos', JSON.stringify(todosLocalStorage));

JSON.parse(localStorage.getItem('todos')).forEach(todo => {
    let listItem = createNewTodoElement(todo);
    document.getElementById("list-of-todos").appendChild(listItem);
    let deleteButton = listItem.querySelector('button.delete-button');
    deleteButton.onclick = completeTodo;
}); 

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