import { json, votesStore, getSession, isAdmin, SESSION_KEY } from "./lib/shared.js";

export default async (req) => {
  const store = votesStore();

  // GET público: a página de votação precisa saber se a votação está aberta
  // e qual é o sessionId atual (para a chave de localStorage), além do título e descrição.
  if (req.method === "GET") {
    return json(await getSession(store));
  }

  // POST administrativo: encerrar / reabrir a votação e/ou alterar título e descrição.
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

    const session = await getSession(store);
    if (typeof body?.open === "boolean") session.open = body.open;
    if (typeof body?.title === "string") session.title = body.title.slice(0, 120);
    if (typeof body?.description === "string") session.description = body.description.slice(0, 1000);
    await store.setJSON(SESSION_KEY, session);

    return json({ success: true, ...session });
  }

  return json({ error: "Método não permitido." }, 405);
};