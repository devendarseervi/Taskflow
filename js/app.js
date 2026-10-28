
import {
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

function initializeApp() {
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

  const saved = saveUser(name);

  if (!saved) {
    loginMessage.textContent =
      "Unable to save your session. Please check browser storage settings.";
    return;
  }

  showDashboard({ name });
  loginForm.reset();
});

logoutButton.addEventListener("click", () => {
  const cleared = clearUser();

  if (!cleared) {
    loginMessage.textContent =
      "Unable to clear your session. Please try again.";
    return;
  }

  showLogin();
  usernameInput.focus();
});

initializeApp();
