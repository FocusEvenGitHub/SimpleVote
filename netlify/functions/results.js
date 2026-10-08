import { json, votesStore, getSession, countBlobs, isAdmin } from "./lib/shared.js";

export default async (req) => {
  if (req.method !== "GET") {
    return json({ error: "Método não permitido." }, 405);
  }

  if (!isAdmin(req)) {
    return json({ error: "Senha administrativa inválida." }, 401);
  }

  const store = votesStore();
  const session = await getSession(store);
  const [sim, nao, abstencao] = await Promise.all([
    countBlobs(store, `sessions/${session.id}/sim/`),
    countBlobs(store, `sessions/${session.id}/nao/`),
    countBlobs(store, `sessions/${session.id}/abstencao/`),
  ]);

  return json({
    sim,
    nao,
    abstencao,
    total: sim + nao + abstencao,
    sessionId: session.id,
    open: session.open,
    title: session.title,
    description: session.description,
  });
};