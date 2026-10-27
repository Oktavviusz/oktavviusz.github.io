class Todo {
  constructor(listElement) {
    this.listElement = listElement;
    this.term = '';
    this.editingId = null;
    this.tasks = this.load();
    this.nextId = Number(localStorage.getItem('nextId')) || 1;
  }

  load() {
    try {
      const saved = localStorage.getItem('tasks');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Nie udało się odczytać Local Storage', e);
    }
    return [];
  }

  save() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('nextId', String(this.nextId));
  }
  newId() {
    return this.nextId++;
  }

  // komunikaty
  static validate(text, date) {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return 'Zadanie musi mieć co najmniej 3 znaki.';
    }
    if (trimmed.length > 255) {
      return 'Zadanie może mieć maksymalnie 255 znaków.';
    }
    if (date && new Date(date).toDateString() === new Date().toDateString()) {
      return 'Jak masz zrobić dzisiaj to może zrób od razu co?.';
    }
    if (date && new Date(date) < new Date()) {
      return 'Powrót do przeszłości? Chyba nie.';
    }
    return null;
  }

  add(text, date = '') {
    const error = Todo.validate(text, date);
    if (error) return error;

    this.tasks.push({ id: this.newId(), text: text.trim(), date: date });
    this.save();
    this.draw();
    return null;
  }

  remove(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.save();
    this.draw();
  }

  edit(id, text, date = '') {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return 'Nie znaleziono zadania.';

    const error = Todo.validate(text, date === task.date ? '' : date);
    if (error) return error;

    task.text = text.trim();
    task.date = date;
    this.editingId = null;
    this.save();
    this.draw();
    return null;
  }

  startEdit(id) {
    this.editingId = id;
    this.draw();
    const input = this.listElement.querySelector('.edit-text');
    if (input) input.focus();
  }

  cancelEdit() {
    this.editingId = null;
    this.draw();
  }

  setTerm(term) {
    this.term = term;
    this.draw();
  }

  get filteredTasks() {
    const term = this.term.trim().toLowerCase();
    if (term.length < 2) return this.tasks;
    return this.tasks.filter(task => task.text.toLowerCase().includes(term));
  }

  // Z podświetlaniem pomogło claude opus 5.5
  highlight(text) {
    const fragment = document.createDocumentFragment();
    const term = this.term.trim();

    if (term.length < 2) {
      fragment.append(text);
      return fragment;
    }

    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let pos = 0;
    let index;

    while ((index = lowerText.indexOf(lowerTerm, pos)) !== -1) {
      fragment.append(text.slice(pos, index));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(index, index + term.length);
      fragment.append(mark);
      pos = index + term.length;
    }
    fragment.append(text.slice(pos));
    return fragment;
  }

  draw() {
    this.listElement.innerHTML = '';
    const tasks = this.filteredTasks;

    if (tasks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'Wszystko zrobione';
      this.listElement.append(empty);
      return;
    }

    for (const task of tasks) {
      const li = document.createElement('li');
      li.dataset.id = task.id;

      if (task.id === this.editingId) {
        // Widok edycji
        li.classList.add('editing');

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'edit-text';
        textInput.value = task.text;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'edit-date';
        dateInput.value = task.date;

        li.append(textInput, dateInput);
      } else {
        // Zwykły widok zadania
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.append(this.highlight(task.text));

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = task.date;

        li.append(textSpan, dateSpan);
      }

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.title = 'Usuń';
      deleteButton.textContent = 'Usuń';
      li.append(deleteButton);

      this.listElement.append(li);
    }
  }
}


const todo = new Todo(document.getElementById('taskList'));
document.todo = todo;
todo.draw();

const searchInput = document.getElementById('searchInput');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addButton = document.getElementById('addButton');


// Pomagał mi Claude opus 5.5 w tym fragmencie
function finishEditing() {
  if (todo.editingId === null) return true;

  const li = document.querySelector('#taskList li.editing');
  if (!li) {
    todo.cancelEdit();
    return true;
  }

  const error = todo.edit(
    todo.editingId,
    li.querySelector('.edit-text').value,
    li.querySelector('.edit-date').value
  );
  if (error) {
    alert(error);
    return false;
  }
  return true;
}

function addTask() {
  if (!finishEditing()) return;

  const error = todo.add(taskInput.value, dateInput.value);
  if (error) {
    alert(error);
    return;
  }
  taskInput.value = '';
  dateInput.value = '';
}


addButton.addEventListener('click', addTask);

searchInput.addEventListener('input', () => todo.setTerm(searchInput.value));

document.addEventListener('click', (event) => {
  if (event.target === addButton) return;

  const li = event.target.closest('#taskList li[data-id]');
  const id = li ? Number(li.dataset.id) : null;

  if (event.target.closest('.delete-button')) {
    if (id !== todo.editingId && !finishEditing()) return;
    todo.remove(id);
    return;
  }

  if (li && id === todo.editingId) return;

  if (!finishEditing()) return;

  if (li) todo.startEdit(id);
});

