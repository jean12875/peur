import {
  SESSION_TTL_SECONDS,
  redis,
  errorCode,
  normalizePhone,
  legacyAccountKeyByPhone,
  normalizeEmail,
  validateEmail,
  sessionKey,
  jsonResponse,
  randomToken,
  verifyPassword,
  getAccount,
  saveAccount,
  publicAccount,
} from "../_lib/auth.js";

// migration ponctuelle pour les comptes créés avant le passage à
// l'email : on ne garde plus le numéro de téléphone comme identifiant,
// donc ce chemin retrouve l'ancien compte (encore stocké sous son
// ancienne clé "téléphone"), lui attache un email, et le republie sous
// la nouvelle clé "email" — l'ancienne clé est ensuite supprimée.
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
  const email = normalizeEmail(body.email);

  if (phone.length < 6 || !password) {
    return jsonResponse({ error: "Numéro et mot de passe requis." }, 400);
  }
  if (!validateEmail(email)) {
    return jsonResponse({ error: "Adresse email invalide." }, 400);
  }

  try {
    const oldKey = legacyAccountKeyByPhone(phone);
    const raw = await redis(env, ["GET", oldKey]);
    if (!raw) {
      return jsonResponse({ error: "Aucun ancien compte trouvé avec ce numéro." }, 404);
    }
    const oldAccount = JSON.parse(raw);

    const ok = await verifyPassword(password, oldAccount.passwordSalt, oldAccount.passwordHash);
    if (!ok) {
      return jsonResponse({ error: "Identifiants invalides." }, 401);
    }

    const existingNew = await getAccount(env, email);
    if (existingNew) {
      return jsonResponse({ error: "Un compte existe déjà avec cet email." }, 409);
    }

    const newAccount = Object.assign({}, oldAccount, { email, phone: undefined });
    delete newAccount.phone;
    await saveAccount(env, email, newAccount);
    await redis(env, ["DEL", oldKey]);

    const token = randomToken();
    await redis(env, ["SET", sessionKey(token), email, "EX", String(SESSION_TTL_SECONDS)]);

    return jsonResponse({ token, account: publicAccount(newAccount) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
