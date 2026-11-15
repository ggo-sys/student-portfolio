/* ==========================================================================
   planner.js — the Academic Planner page
   The whole page is driven by ONE array. Every function either changes that
   array or draws it back onto the screen. Nothing is stored in the HTML:
   the <li> elements are created and destroyed by this file.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. The data
   Each task is an object with a unique id, its text, and a done flag.
   -------------------------------------------------------------------------- */
let tasks = [];

// Key used to save the array into the browser so tasks survive a refresh.
const STORAGE_KEY = 'csc106-planner-tasks';

/* Unique ids come from a counter, NOT from Date.now().
   Two tasks added inside the same millisecond would share a timestamp, and
   deleteTask() would then remove both of them at once. */
let idCounter = 0;

function nextId() {
  idCounter += 1;
  return idCounter;
}

// Element references, looked up once instead of on every call.
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const statTotal = document.getElementById('statTotal');
const statDone = document.getElementById('statDone');
const statLeft = document.getElementById('statLeft');

/* --------------------------------------------------------------------------
   2. Saving and loading
   localStorage can only hold text, so the array is converted with
   JSON.stringify() on the way out and JSON.parse() on the way back in.
   -------------------------------------------------------------------------- */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // Private mode, a file:// origin, or a full quota can all throw here.
    // The planner must still work in memory, so this is not allowed to break it.
    console.warn('Tasks could not be saved:', error);
  }
}

function loadTasks() {
  let saved = null;

  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Saved tasks could not be read:', error);
    return;
  }

  if (!saved) {
    return; // First visit: start with an empty array.
  }

  try {
    const parsed = JSON.parse(saved);

    // Only accept an array — a corrupted value should not break the page.
    if (Array.isArray(parsed)) {
      tasks = parsed;

      // Keep the counter ahead of anything already saved, so a restart cannot
      // hand out an id that an existing task is already using.
      tasks.forEach(function (task) {
        if (typeof task.id === 'number' && task.id > idCounter) {
          idCounter = task.id;
        }
      });
    }
  } catch (error) {
    console.warn('Saved tasks could not be read:', error);
    tasks = [];
  }
}

/* --------------------------------------------------------------------------
   3. The three actions
   Each one changes the array, then redraws and saves.
   -------------------------------------------------------------------------- */

// ADD: takes the text, ignores blanks, pushes a new object.
function addTask(text) {
  const clean = text.trim();

  if (clean === '') {
    return false;
  }

  tasks.push({
    id: nextId(),
    text: clean,
    done: false
  });

  saveTasks();
  renderTasks();
  return true;
}

// TOGGLE: find the task by id and flip its done flag.
function toggleTask(id) {
  const task = tasks.find(function (item) {
    return item.id === id;
  });

  if (!task) {
    return;
  }

  task.done = !task.done;

  saveTasks();
  renderTasks();
}

// DELETE: keep every task whose id is different from the one asked for.
function deleteTask(id) {
  tasks = tasks.filter(function (item) {
    return item.id !== id;
  });

  saveTasks();
  renderTasks();
}

/* --------------------------------------------------------------------------
   4. Drawing the list
   Clear the <ul>, then build one <li> per task from scratch.
   -------------------------------------------------------------------------- */
function renderTasks() {
  // Start from nothing so the list can never drift out of step with the array.
  taskList.innerHTML = '';

  tasks.forEach(function (task) {
    const item = document.createElement('li');
    item.className = task.done ? 'task is-done' : 'task';
    item.dataset.id = task.id;        // remembered so handlers know which task it is

    // -- checkbox -----------------------------------------------------------
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.className = 'task-toggle';
    checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as completed');

    // -- the text -----------------------------------------------------------
    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = task.text;    // textContent, not innerHTML: no HTML injection

    // -- delete button ------------------------------------------------------
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'delete-btn';
    removeBtn.textContent = 'Delete';
    removeBtn.setAttribute('aria-label', 'Delete task: ' + task.text);

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(removeBtn);
    taskList.appendChild(item);
  });

  updateStats();

  // Show the empty-state panel only when there is nothing to show.
  emptyState.style.display = tasks.length === 0 ? 'block' : 'none';
}

/* --------------------------------------------------------------------------
   5. The counters
   -------------------------------------------------------------------------- */
function updateStats() {
  const done = tasks.filter(function (task) {
    return task.done;
  }).length;

  statTotal.textContent = tasks.length;
  statDone.textContent = done;
  statLeft.textContent = tasks.length - done;
}

/* --------------------------------------------------------------------------
   6. Wiring up the events
   -------------------------------------------------------------------------- */

// Submitting the form adds a task.
taskForm.addEventListener('submit', function (event) {
  event.preventDefault();            // stop the browser trying to reload the page

  const added = addTask(taskInput.value);

  if (added) {
    taskInput.value = '';            // clear the box
    taskInput.focus();               // keep the cursor there for the next task
  } else {
    taskInput.focus();
  }
});

/* One listener on the list handles every task, present and future.
   This is event delegation: the child controls fire the event, but it is
   caught by the parent, which reads data-id to work out which task it was. */
taskList.addEventListener('click', function (event) {
  const button = event.target.closest('.delete-btn');

  if (!button) {
    return;
  }

  const id = Number(button.closest('.task').dataset.id);
  deleteTask(id);
});

taskList.addEventListener('change', function (event) {
  if (!event.target.classList.contains('task-toggle')) {
    return;
  }

  const id = Number(event.target.closest('.task').dataset.id);
  toggleTask(id);
});

/* --------------------------------------------------------------------------
   7. First run
   Load anything saved, then draw it.
   -------------------------------------------------------------------------- */
loadTasks();
renderTasks();
