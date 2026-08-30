import { json, votesStore, getSession, VALID_OPTIONS } from "./lib/shared.js";

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Payload inválido." }, 400);
  }

  const option = body?.option;
  if (!VALID_OPTIONS.includes(option)) {
    return json({ error: "Opção inválida." }, 400);
  }

  const sessionId = body?.sessionId;
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return json({ error: "Sessão inválida." }, 400);
  }

  const store = votesStore();
  const session = await getSession(store);

  // O navegador pode estar com uma página aberta de uma votação antiga
  // (ex.: o admin resetou enquanto a página estava aberta).
  if (sessionId !== session.id) {
    return json({ error: "A votação foi reiniciada. Atualize a página." }, 409);
  }

  if (!session.open) {
    return json({ error: "Votação encerrada." }, 403);
  }

  // Cada voto é um blob independente dentro da sessão atual:
  // sessions/{sessionId}/{option}/{uuid} -> "1"
  await store.set(`sessions/${session.id}/${option}/${crypto.randomUUID()}`, "1");

  return json({ success: true });
};