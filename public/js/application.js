document.getElementById("add-todo-button").addEventListener('click', addTodo);
let todoList = null;

retrieveTodos((todos) => {
    todoList = todos;
    populateFromList(todoList);
});

function updateTodos() {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/updateTodos', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ todos: todoList }));
}

function retrieveTodos(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/retrieveTodos', true);
    xhr.send();
    xhr.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            if (!response.todos) return;
            callback(response.todos);
        }
    };
}

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

    todoList.push(document.getElementById("new-todo").value);
    updateTodos();

    document.getElementById("new-todo").value = '';
}

function completeTodo() {
    let listItem = this.parentNode;
    listItem.querySelector('label').style.textDecoration = 'line-through';
    listItem.querySelector('button.delete-button').innerText = '✔️';

    todoList.splice(todoList.indexOf(listItem.querySelector('label').innerText), 1);
    updateTodos();
}

function populateFromList(todoList) {
    todoList.forEach(todo => {
        let listItem = createNewTodoElement(todo);
        document.getElementById("list-of-todos").appendChild(listItem);
        let deleteButton = listItem.querySelector('button.delete-button');
        deleteButton.onclick = completeTodo;
    });
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