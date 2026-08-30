const PASSWORD_KEY = "simplevote_admin_password";

const loginSection = document.getElementById("login");
const dashboardSection = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");
const statusBadge = document.getElementById("status-badge");
const refreshBtn = document.getElementById("refresh-btn");
const toggleBtn = document.getElementById("toggle-btn");
const logoutBtn = document.getElementById("logout-btn");
const resetBtn = document.getElementById("reset-btn");
const adminMessage = document.getElementById("admin-message");

let currentOpen = true;

function showMessage(text, type = "") {
  adminMessage.textContent = text;
  adminMessage.className = `message ${type}`.trim();
}

function getPassword() {
  return sessionStorage.getItem(PASSWORD_KEY);
}

function setPassword(password) {
  sessionStorage.setItem(PASSWORD_KEY, password);
}

function clearPassword() {
  sessionStorage.removeItem(PASSWORD_KEY);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": getPassword(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function renderResults(results) {
  const total = results.total || 0;
  const percent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  document.getElementById("sim-count").textContent = results.sim;
  document.getElementById("nao-count").textContent = results.nao;
  document.getElementById("abstencao-count").textContent = results.abstencao;
  document.getElementById("total-count").textContent = total;

  document.getElementById("sim-percent").textContent = percent(results.sim) + "%";
  document.getElementById("nao-percent").textContent = percent(results.nao) + "%";
  document.getElementById("abstencao-percent").textContent = percent(results.abstencao) + "%";

  document.getElementById("sim-bar").style.width = percent(results.sim) + "%";
  document.getElementById("nao-bar").style.width = percent(results.nao) + "%";
  document.getElementById("abstencao-bar").style.width = percent(results.abstencao) + "%";

  currentOpen = results.open;
  renderStatus();
}

function renderStatus() {
  statusBadge.textContent = currentOpen ? "ABERTA" : "FECHADA";
  statusBadge.className = `badge ${currentOpen ? "open" : "closed"}`;
  toggleBtn.textContent = currentOpen ? "Encerrar votação" : "Reabrir votação";
}

async function loadResults() {
  showMessage("");
  refreshBtn.disabled = true;
  try {
    const { res, data } = await api("/.netlify/functions/results");
    if (res.ok) {
      renderResults(data);
      showMessage("Resultados atualizados.", "success");
    } else if (res.status === 401) {
      showLogin();
      loginError.textContent = "Senha inválida. Tente novamente.";
    } else {
      showMessage(data.error || "Erro ao carregar resultados.", "error");
    }
  } catch {
    showMessage("Erro de conexão ao carregar resultados.", "error");
  } finally {
    refreshBtn.disabled = false;
  }
}

function showLogin() {
  clearPassword();
  dashboardSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
  passwordInput.value = "";
  passwordInput.focus();
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value.trim();
  if (!password) return;

  loginError.textContent = "";
  setPassword(password);
  showDashboard();
  await loadResults();
});

refreshBtn.addEventListener("click", loadResults);

toggleBtn.addEventListener("click", async () => {
  toggleBtn.disabled = true;
  showMessage("");
  try {
    const { res, data } = await api("/.netlify/functions/session", {
      method: "POST",
      body: JSON.stringify({ open: !currentOpen }),
    });
    if (res.ok) {
      currentOpen = data.open;
      renderStatus();
      showMessage(currentOpen ? "Votação reaberta." : "Votação encerrada.", "success");
    } else if (res.status === 401) {
      showLogin();
    } else {
      showMessage(data.error || "Erro ao alterar o estado da votação.", "error");
    }
  } catch {
    showMessage("Erro de conexão. Tente novamente.", "error");
  } finally {
    toggleBtn.disabled = false;
  }
});

resetBtn.addEventListener("click", async () => {
  const confirmed = window.confirm(
    "Tem certeza que deseja apagar TODOS os votos?\n\nEssa ação não poderá ser desfeita."
  );
  if (!confirmed) return;

  resetBtn.disabled = true;
  showMessage("");
  try {
    const { res, data } = await api("/.netlify/functions/reset", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (res.ok) {
      await loadResults();
      showMessage("Votação resetada com sucesso.", "success");
    } else if (res.status === 401) {
      showLogin();
    } else {
      showMessage(data.error || "Erro ao resetar a votação.", "error");
    }
  } catch {
    showMessage("Erro de conexão. Tente novamente.", "error");
  } finally {
    resetBtn.disabled = false;
  }
});

logoutBtn.addEventListener("click", () => {
  showLogin();
  showMessage("");
});

// Se a senha já estiver nesta aba, entra direto no painel.
if (getPassword()) {
  showDashboard();
  loadResults();
}