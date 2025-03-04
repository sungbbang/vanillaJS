const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

let todos = [];
const TODOS_KEY = 'todos';

const savedTodos = localStorage.getItem(TODOS_KEY);
if (savedTodos) {
  const parsedTodos = JSON.parse(savedTodos);
  todos = parsedTodos;
  parsedTodos.forEach(paintTodo);
}

function paintTodo(todo) {
  const li = document.createElement('li');
  li.id = todo.id;
  const button = document.createElement('button');
  button.textContent = '삭제';
  button.addEventListener('click', deleteTodo);
  const span = document.createElement('span');
  span.textContent = todo.text;

  li.appendChild(button);
  li.appendChild(span);
  todoList.appendChild(li);
}

function deleteTodo(e) {
  const li = e.target.parentElement;
  li.remove();
  todos = todos.filter(todo => parseInt(li.id) !== todo.id);
  saveTodos();
}

todoForm.addEventListener('submit', handleSubmitTodo);

function handleSubmitTodo(e) {
  e.preventDefault();

  const newTodoObj = {
    text: todoInput.value,
    id: Date.now(),
  };
  todoInput.value = '';
  todos.push(newTodoObj);
  saveTodos();
  paintTodo(newTodoObj);
}

function saveTodos() {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}
