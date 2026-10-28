
const TASKS_KEY = "taskflow_tasks";
const USER_KEY = "taskflow_user";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getTasks() {
  const tasks = readStorage(TASKS_KEY, []);
  return Array.isArray(tasks) ? tasks : [];
}

export function saveTasks(tasks) {
  if (!Array.isArray(tasks)) {
    return false;
  }

  return writeStorage(TASKS_KEY, tasks);
}

export function getUser() {
  const user = readStorage(USER_KEY, null);

  if (
    user &&
    typeof user.name === "string" &&
    user.name.trim().length > 0
  ) {
    return user;
  }

  return null;
}

export function saveUser(name) {
  if (typeof name !== "string" || !name.trim()) {
    return false;
  }

  return writeStorage(USER_KEY, {
    name: name.trim(),
  });
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
    return true;
  } catch {
    return false;
  }
}
