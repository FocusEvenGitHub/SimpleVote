import { json, votesStore, getSession, VALID_OPTIONS } from "./_shared.js";

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

  const store = votesStore();
  const session = await getSession(store);
  if (!session.open) {
    return json({ error: "Votação encerrada." }, 403);
  }

  // Cada voto é um blob independente: {option}/{uuid} -> "1"
  await store.set(`${option}/${crypto.randomUUID()}`, "1");

  return json({ success: true });
};