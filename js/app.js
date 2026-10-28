
import {
  getTasks,
  saveTasks,
  getUser,
  saveUser,
  clearUser
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

    const description = document.createElement("p");
    description.textContent = task.description || "No description provided.";

    card.append(title, description);
    taskList.append(card);
  });
}

function openNewTaskDialog() {
  taskForm.reset();
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

  const newTask = {
    id: crypto.randomUUID(),
    title,
    description,
    completed: false,
    createdAt: new Date().toISOString()
  };

  const updatedTasks = [...tasks, newTask];

  if (!saveTasks(updatedTasks)) {
    taskStatus.textContent =
      "Unable to save this task. Browser storage may be full or unavailable.";
    return;
  }

  tasks = updatedTasks;
  renderTasks();
  taskDialog.close();
  taskForm.reset();
});

initializeApp();
