import { getSessionPhone, getAccount, saveAccount, jsonResponse, publicAccount, errorCode } from "../_lib/auth.js";

function tokenFromRequest(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = tokenFromRequest(request);
  if (!token) return jsonResponse({ error: "Non connecté." }, 401);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Requête invalide." }, 400);
  }

  try {
    const phone = await getSessionPhone(env, token);
    if (!phone) return jsonResponse({ error: "Session expirée." }, 401);
    const account = await getAccount(env, phone);
    if (!account) return jsonResponse({ error: "Compte introuvable." }, 404);

    // le client envoie sa sauvegarde + trace locales — on écrase simplement
    // côté serveur (le serveur ne fait pas de fusion intelligente, c'est
    // volontairement simple pour un usage mono-appareil ou occasionnel)
    if (body.save !== undefined) account.save = body.save;
    if (body.trace !== undefined) account.trace = body.trace;
    if (body.notif !== undefined) account.notif = !!body.notif;

    await saveAccount(env, phone, account);
    return jsonResponse({ ok: true, account: publicAccount(account) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
