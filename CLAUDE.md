# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

SimpleVote: a Yes/No/Abstain ("sim"/"nao"/"abstencao") voting app for informal meetings. Static vanilla HTML/CSS/JS frontend in `public/`, Netlify Functions backend in `netlify/functions/`, storage in Netlify Blobs. No framework, no build step, no database. UI text, error messages and code comments are in Portuguese (pt-BR) — keep them that way.

## Commands

- `npm install` then `netlify dev` (or `npm run dev`) — serves at http://localhost:8888, admin at `/admin/`. Requires the global `netlify-cli`.
- Requires `.env` with `ADMIN_PASSWORD` (copy `.env.example`).
- There are no tests, linter, or build step.

## Architecture

- **Single active session**: the blob `session/active` in store `votes` holds `{ id, open, title, description }` (title/description are set from the admin page, shown on the voter page, and kept across resets). `getSession()` in `netlify/functions/lib/shared.js` lazily creates it with `onlyIfNew` to avoid races. The store uses `consistency: "strong"` so open/close/reset are visible immediately — keep that.
- **Votes**: one blob per vote at `sessions/{sessionId}/{option}/{uuid}`; counts come from `store.list({ prefix })` (`countBlobs`). There is no counter blob.
- **Reset** just writes a new session id; old vote blobs are orphaned, not deleted.
- **Stale-page handling**: `vote.js` requires the client's `sessionId` and returns 409 if it doesn't match the active session; `public/app.js` re-syncs via `init()` on 409.
- **Duplicate-vote prevention** is client-side only: `localStorage` key `simplevote_voted_{sessionId}`. Not real voter authentication — by design.
- **Admin auth**: `x-admin-password` header compared to `process.env.ADMIN_PASSWORD` via `isAdmin()`. Admin page stores the password in `sessionStorage`. `GET /session` is public; `POST /session` (open/close), `GET /results`, `POST /reset` are admin-only.
- Functions use the modern Netlify signature (`export default async (req) => Response`) with the shared `json()` helper; the package is ESM (`"type": "module"`).
