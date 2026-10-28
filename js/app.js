import {
  getTasks,
  saveTasks,
  getUser,
  saveUser,
  clearUser,
} from "./storage.js";

const loginSection = document.querySelector("#login-section");
const dashboardSection = document.querySelector("#dashboard-section");
const loginForm = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const loginMessage = document.querySelector("#login-message");
const welcomeMessage = document.querySelector("#welcome-message");
const logoutButton = document.querySelector("#logout-button");

const addTaskButton = document.querySelector("#add-task-button");
const taskDialog = document.querySelector("#task-dialog");
const taskForm = document.querySelector("#task-form");
const taskTitleInput = document.querySelector("#task-title");
const taskDescriptionInput = document.querySelector("#task-description");
const cancelTaskButton = document.querySelector("#cancel-task-button");
const taskList = document.querySelector("#task-list");
const taskStatus = document.querySelector("#task-status");

let tasks = getTasks();
let editingTaskId = null;

function showDashboard(user) {
  loginSection.hidden = true;
  dashboardSection.hidden = false;
  logoutButton.hidden = false;
  welcomeMessage.textContent = `Welcome, ${user.name}!`;
}

function showLogin() {
  loginSection.hidden = false;
  dashboardSection.hidden = true;
  logoutButton.hidden = true;
  loginMessage.textContent = "";
}

function persistTasks(updatedTasks) {
  if (!saveTasks(updatedTasks)) {
    taskStatus.textContent =
      "Unable to save changes. Browser storage may be full or unavailable.";
    return false;
  }

  tasks = updatedTasks;
  renderTasks();
  return true;
}

function renderTasks() {
  taskList.replaceChildren();

  if (tasks.length === 0) {
    taskStatus.textContent = "No tasks yet. Add your first task!";
    return;
  }

  taskStatus.textContent = "";

  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = "task-card";

    const title = document.createElement("h3");
    title.textContent = task.title;

    if (task.completed) {
      title.classList.add("task-completed");
    }

    const description = document.createElement("p");
    description.textContent = task.description || "No description provided.";

    const status = document.createElement("p");
    status.textContent = task.completed ? "Completed" : "Pending";
    status.className = "task-status-label";

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.textContent = task.completed
      ? "Mark Pending"
      : "Mark Completed";
    toggleButton.addEventListener("click", () => {
      const updatedTasks = tasks.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item,
      );

      persistTasks(updatedTasks);
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      openEditTaskDialog(task);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this task?",
      );

      if (!confirmed) return;

      const updatedTasks = tasks.filter((item) => item.id !== task.id);

      persistTasks(updatedTasks);
    });

    actions.append(toggleButton, editButton, deleteButton);
    card.append(title, description, status, actions);
    taskList.append(card);
  });
}

function openNewTaskDialog() {
  editingTaskId = null;
  taskForm.reset();
  document.querySelector("#task-dialog-title").textContent = "Add a Task";
  taskForm.querySelector('button[type="submit"]').textContent = "Save Task";
  taskDialog.showModal();
  taskTitleInput.focus();
}

function openEditTaskDialog(task) {
  editingTaskId = task.id;
  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description || "";
  document.querySelector("#task-dialog-title").textContent = "Edit Task";
  taskForm.querySelector('button[type="submit"]').textContent = "Save Changes";
  taskDialog.showModal();
  taskTitleInput.focus();
}

function initializeApp() {
  renderTasks();

  const user = getUser();

  if (user) {
    showDashboard(user);
  } else {
    showLogin();
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = usernameInput.value.trim();

  if (!name) {
    loginMessage.textContent = "Please enter your name.";
    usernameInput.focus();
    return;
  }

  if (!saveUser(name)) {
    loginMessage.textContent =
      "Unable to save your session. Check browser storage settings.";
    return;
  }

  showDashboard({ name });
  loginForm.reset();
});

logoutButton.addEventListener("click", () => {
  if (!clearUser()) {
    loginMessage.textContent =
      "Unable to clear your session. Please try again.";
    return;
  }

  showLogin();
  usernameInput.focus();
});

addTaskButton.addEventListener("click", openNewTaskDialog);

cancelTaskButton.addEventListener("click", () => {
  taskDialog.close();
});

taskDialog.addEventListener("click", (event) => {
  if (event.target === taskDialog) {
    taskDialog.close();
  }
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();

  if (!title) {
    taskTitleInput.focus();
    return;
  }

  if (editingTaskId) {
    const updatedTasks = tasks.map((task) =>
      task.id === editingTaskId ? { ...task, title, description } : task,
    );

    if (!persistTasks(updatedTasks)) {
      return;
    }
  } else {
    const newTask = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    if (!persistTasks([...tasks, newTask])) {
      return;
    }
  }

  taskDialog.close();
  taskForm.reset();
  editingTaskId = null;
});

taskDialog.addEventListener("close", () => {
  editingTaskId = null;
});

initializeApp();
