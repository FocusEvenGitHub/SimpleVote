import { json, votesStore, isAdmin, SESSION_KEY } from "./lib/shared.js";

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  if (!isAdmin(req)) {
    return json({ error: "Senha administrativa inválida." }, 401);
  }

  const store = votesStore();

  // Reset O(1): apenas troca a sessão. Os votos antigos ficam órfãos
  // (não são mais contados) e quem votou antes pode votar novamente.
  await store.setJSON(SESSION_KEY, { id: crypto.randomUUID(), open: true });

  return json({ success: true });
};