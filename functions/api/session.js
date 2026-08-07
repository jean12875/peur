import { getSessionEmail, getAccount, jsonResponse, publicAccount, errorCode } from "../_lib/auth.js";

function tokenFromRequest(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const token = tokenFromRequest(request);
  if (!token) return jsonResponse({ error: "Non connecté." }, 401);

  try {
    const email = await getSessionEmail(env, token);
    if (!email) return jsonResponse({ error: "Session expirée." }, 401);
    const account = await getAccount(env, email);
    if (!account) return jsonResponse({ error: "Compte introuvable." }, 404);
    return jsonResponse({ account: publicAccount(account) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
