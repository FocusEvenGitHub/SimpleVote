import { json, votesStore, getSession, isAdmin, SESSION_KEY } from "./lib/shared.js";

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  if (!isAdmin(req)) {
    return json({ error: "Senha administrativa inválida." }, 401);
  }

  const store = votesStore();
  const current = await getSession(store);

  // Reset O(1): apenas troca a sessão. Os votos antigos ficam órfãos
  // (não são mais contados) e quem votou antes pode votar novamente.
  // Título e descrição são mantidos; o admin pode editá-los depois.
  await store.setJSON(SESSION_KEY, {
    id: crypto.randomUUID(),
    open: true,
    title: current.title || "",
    description: current.description || "",
  });

  return json({ success: true });
};