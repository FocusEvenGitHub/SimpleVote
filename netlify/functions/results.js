import { json, votesStore, getSession, countBlobs, isAdmin } from "./_shared.js";

export default async (req) => {
  if (req.method !== "GET") {
    return json({ error: "Método não permitido." }, 405);
  }

  if (!isAdmin(req)) {
    return json({ error: "Senha administrativa inválida." }, 401);
  }

  const store = votesStore();
  const [sim, nao, abstencao, session] = await Promise.all([
    countBlobs(store, "sim/"),
    countBlobs(store, "nao/"),
    countBlobs(store, "abstencao/"),
    getSession(store),
  ]);

  return json({
    sim,
    nao,
    abstencao,
    total: sim + nao + abstencao,
    sessionId: session.id,
    open: session.open,
  });
};