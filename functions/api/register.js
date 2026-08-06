import {
  SESSION_TTL_SECONDS,
  redis,
  normalizePhone,
  accountKey,
  sessionKey,
  jsonResponse,
  randomToken,
  hashPassword,
  getAccount,
  saveAccount,
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

  const prenom = String(body.prenom || "").trim().slice(0, 24);
  const nom = String(body.nom || "").trim().slice(0, 24);
  const phone = normalizePhone(body.phone);
  const password = String(body.password || "");
  const notif = !!body.notif;

  if (!prenom || !nom) {
    return jsonResponse({ error: "Prénom et nom obligatoires." }, 400);
  }
  if (phone.length < 6) {
    return jsonResponse({ error: "Numéro de téléphone invalide." }, 400);
  }
  if (password.length < 4) {
    return jsonResponse({ error: "Le mot de passe doit faire au moins 4 caractères." }, 400);
  }

  try {
    const existing = await getAccount(env, phone);
    if (existing) {
      return jsonResponse({ error: "Un compte existe déjà avec ce numéro. Essaie de te connecter." }, 409);
    }

    const { hash, salt } = await hashPassword(password);
    const account = {
      phone,
      prenom,
      nom,
      notif,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: Date.now(),
      save: null,
      trace: null,
    };
    await saveAccount(env, phone, account);

    const token = randomToken();
    await redis(env, ["SET", sessionKey(token), phone, "EX", String(SESSION_TTL_SECONDS)]);

    return jsonResponse({ token, account: publicAccount(account) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur." }, 500);
  }
}
