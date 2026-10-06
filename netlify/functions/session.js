import { json, votesStore, getSession, isAdmin, SESSION_KEY } from "./lib/shared.js";

export default async (req) => {
  const store = votesStore();

  // GET público: a página de votação precisa saber se a votação está aberta
  // e qual é o sessionId atual (para a chave de localStorage).
  if (req.method === "GET") {
    const session = await getSession(store);
    return json({
      id: session.id,
      open: session.open,
      title: session.title || "",
      description: session.description || "",
    });
  }

  // POST administrativo: encerrar / reabrir a votação e/ou
  // alterar título e descrição exibidos na página de votação.
  if (req.method === "POST") {
    if (!isAdmin(req)) {
      return json({ error: "Senha administrativa inválida." }, 401);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Payload inválido." }, 400);
    }

    const { open, title, description } = body ?? {};
    const hasOpen = typeof open === "boolean";
    const hasText = typeof title === "string" && typeof description === "string";
    if (!hasOpen && !hasText) {
      return json({ error: "Payload inválido." }, 400);
    }
    if (hasText && (title.length > 120 || description.length > 1000)) {
      return json({ error: "Título ou descrição muito longos." }, 400);
    }

    const session = await getSession(store);
    if (hasOpen) session.open = open;
    if (hasText) {
      session.title = title.trim();
      session.description = description.trim();
    }
    await store.setJSON(SESSION_KEY, session);

    return json({
      success: true,
      id: session.id,
      open: session.open,
      title: session.title || "",
      description: session.description || "",
    });
  }

  return json({ error: "Método não permitido." }, 405);
};