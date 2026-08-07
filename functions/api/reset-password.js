import {
  redis,
  errorCode,
  normalizePhone,
  resetCodeKey,
  jsonResponse,
  hashPassword,
  getAccount,
  saveAccount,
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
  const code = String(body.code || "").trim();
  const newPassword = String(body.newPassword || "");

  if (phone.length < 6 || !code) {
    return jsonResponse({ error: "Requête invalide." }, 400);
  }
  if (newPassword.length < 4) {
    return jsonResponse({ error: "Le nouveau mot de passe doit faire au moins 4 caractères." }, 400);
  }

  try {
    const stored = await redis(env, ["GET", resetCodeKey(phone)]);
    if (!stored || stored !== code) {
      return jsonResponse({ error: "Code invalide ou expiré." }, 401);
    }
    const account = await getAccount(env, phone);
    if (!account) {
      return jsonResponse({ error: "Compte introuvable." }, 404);
    }

    const { hash, salt } = await hashPassword(newPassword);
    account.passwordHash = hash;
    account.passwordSalt = salt;
    await saveAccount(env, phone, account);
    await redis(env, ["DEL", resetCodeKey(phone)]);

    return jsonResponse({ ok: true });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
