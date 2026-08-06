import { redis, sessionKey, jsonResponse } from "../_lib/auth.js";

function tokenFromRequest(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = tokenFromRequest(request);
  if (!token) return jsonResponse({ ok: true });
  try {
    await redis(env, ["DEL", sessionKey(token)]);
  } catch (e) {
    // pas grave si ça échoue — le client efface son token local de toute façon
  }
  return jsonResponse({ ok: true });
}
