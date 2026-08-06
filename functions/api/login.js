import {
  SESSION_TTL_SECONDS,
  redis,
  normalizePhone,
  sessionKey,
  jsonResponse,
  randomToken,
  verifyPassword,
  getAccount,
  publicAccount,
} from "../_lib/auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Requête invalide." }, 400);
  }

  const phone = normalizePhone(body.phone);
  const password = String(body.password || "");

  if (!phone || !password) {
    return jsonResponse({ error: "Identifiants invalides." }, 401);
  }

  try {
    const account = await getAccount(env, phone);
    if (!account) {
      return jsonResponse({ error: "Identifiants invalides." }, 401);
    }
    const ok = await verifyPassword(password, account.passwordSalt, account.passwordHash);
    if (!ok) {
      return jsonResponse({ error: "Identifiants invalides." }, 401);
    }

    const token = randomToken();
    await redis(env, ["SET", sessionKey(token), phone, "EX", String(SESSION_TTL_SECONDS)]);

    return jsonResponse({ token, account: publicAccount(account) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", detail: String(e.message) }, 500);
  }
}
