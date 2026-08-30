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
  return getStore({ name: STORE_NAME });
}

export async function getSession(store) {
  try {
    const existing = await store.get(SESSION_KEY, { type: "json" });
    if (existing && existing.id) return existing;
  } catch {
    // sessão corrompida: recria abaixo
  }
  const session = { id: crypto.randomUUID(), open: true };
  await store.setJSON(SESSION_KEY, session);
  return session;
}

export async function countBlobs(store, prefix) {
  // list() sem paginate já retorna todas as páginas automaticamente
  const { blobs } = await store.list({ prefix });
  return blobs.length;
}

export async function deleteVotes(store) {
  for (const prefix of VALID_OPTIONS.map((option) => `${option}/`)) {
    const { blobs } = await store.list({ prefix });
    await Promise.all(blobs.map((blob) => store.delete(blob.key)));
  }
}