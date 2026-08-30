import { json, votesStore, getSession, isAdmin, SESSION_KEY } from "./lib/shared.js";

export default async (req) => {
  const store = votesStore();

  // GET público: a página de votação precisa saber se a votação está aberta
  // e qual é o sessionId atual (para a chave de localStorage).
  if (req.method === "GET") {
    const session = await getSession(store);
    return json({ id: session.id, open: session.open });
  }

  // POST administrativo: encerrar / reabrir a votação.
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

    if (typeof body?.open !== "boolean") {
      return json({ error: "Payload inválido." }, 400);
    }

    const session = await getSession(store);
    session.open = body.open;
    await store.setJSON(SESSION_KEY, session);

    return json({ success: true, id: session.id, open: session.open });
  }

  return json({ error: "Método não permitido." }, 405);
};