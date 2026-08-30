const SESSION_KEY_PREFIX = "simplevote_voted_";

const buttons = Array.from(document.querySelectorAll(".vote-btn"));
const messageEl = document.getElementById("message");

let sessionId = null;

function showMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

function setButtonsDisabled(disabled) {
  buttons.forEach((btn) => (btn.disabled = disabled));
}

function setLoading(button, loading) {
  if (loading) {
    button.dataset.original = button.innerHTML;
    button.innerHTML =
      '<span class="spinner" aria-hidden="true"></span><span>Enviando...</span>';
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.original;
  }
}

async function init() {
  try {
    const res = await fetch("/.netlify/functions/session");
    if (!res.ok) throw new Error("Falha ao buscar sessão");
    const session = await res.json();
    sessionId = session.id;

    if (!session.open) {
      showMessage("Votação encerrada.", "closed");
      return; // botões permanecem desabilitados
    }

    if (localStorage.getItem(SESSION_KEY_PREFIX + sessionId)) {
      showMessage("Seu voto já foi registrado.", "info");
      return; // botões permanecem desabilitados
    }

    setButtonsDisabled(false);
  } catch {
    showMessage("Não foi possível conectar ao servidor. Tente novamente mais tarde.", "error");
  }
}

async function vote(option, button) {
  setButtonsDisabled(true);
  setLoading(button, true);
  showMessage("");

  try {
    const res = await fetch("/.netlify/functions/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      localStorage.setItem(SESSION_KEY_PREFIX + sessionId, "true");
      showMessage("Voto registrado com sucesso.", "success");
      return; // botões permanecem desabilitados
    }

    if (res.status >= 500) {
      // Erro transitório: permite tentar novamente
      showMessage(data.error || "Erro no servidor. Tente novamente.", "error");
      setButtonsDisabled(false);
      return;
    }

    showMessage(data.error || "Não foi possível registrar o voto.", "error");
  } catch {
    showMessage("Erro de conexão. Verifique sua internet e tente novamente.", "error");
    setButtonsDisabled(false);
  } finally {
    setLoading(button, false);
  }
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => vote(btn.dataset.option, btn));
});

init();