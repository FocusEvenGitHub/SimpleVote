import { json, votesStore, deleteVotes, isAdmin, SESSION_KEY } from "./_shared.js";

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  if (!isAdmin(req)) {
    return json({ error: "Senha administrativa inválida." }, 401);
  }

  const store = votesStore();
  await deleteVotes(store);

  // Nova sessão: quem já votou na sessão anterior pode votar novamente.
  await store.setJSON(SESSION_KEY, { id: crypto.randomUUID(), open: true });

  return json({ success: true });
};