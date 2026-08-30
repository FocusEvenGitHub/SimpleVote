import { getStore } from "@netlify/blobs";

export const STORE_NAME = "votes";
export const SESSION_KEY = "session/active";
export const VALID_OPTIONS = ["sim", "nao", "abstencao"];

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function isAdmin(req) {
  const sent = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(sent && expected && sent === expected);
}

export function votesStore() {
  // Consistência forte: encerrar/reabrir, reset e troca de sessionId
  // precisam ficar visíveis imediatamente para todos os leitores.
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export async function getSession(store) {
  const existing = await store.get(SESSION_KEY, { type: "json" }).catch(() => null);
  if (existing && existing.id) return existing;

  const session = { id: crypto.randomUUID(), open: true };
  const { modified } = await store.setJSON(SESSION_KEY, session, { onlyIfNew: true });
  if (modified) return session;

  // Outra requisição criou a sessão primeiro: usa a que está gravada.
  const created = await store.get(SESSION_KEY, { type: "json" }).catch(() => null);
  if (created && created.id) return created;

  // Sessão existente corrompida: sobrescreve.
  await store.setJSON(SESSION_KEY, session);
  return session;
}

export async function countBlobs(store, prefix) {
  // list() sem paginate já retorna todas as páginas automaticamente
  const { blobs } = await store.list({ prefix });
  return blobs.length;
}