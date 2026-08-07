import {
  SESSION_TTL_SECONDS,
  redis,
  errorCode,
  normalizeEmail,
  validateEmail,
  accountKey,
  sessionKey,
  pseudoKey,
  validatePseudo,
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
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const pseudo = String(body.pseudo || "").trim();
  const notif = !!body.notif;

  if (!prenom || !nom) {
    return jsonResponse({ error: "Prénom et nom obligatoires." }, 400);
  }
  if (!validateEmail(email)) {
    return jsonResponse({ error: "Adresse email invalide." }, 400);
  }
  if (password.length < 4) {
    return jsonResponse({ error: "Le mot de passe doit faire au moins 4 caractères." }, 400);
  }
  if (!validatePseudo(pseudo)) {
    return jsonResponse({ error: "Le pseudo doit faire 3 à 20 caractères (lettres, chiffres, underscore)." }, 400);
  }

  try {
    const existing = await getAccount(env, email);
    if (existing) {
      return jsonResponse({ error: "Un compte existe déjà avec cet email. Essaie de te connecter." }, 409);
    }

    // réserve le pseudo de façon atomique (NX = seulement si absent) —
    // évite que deux inscriptions simultanées prennent le même pseudo
    const claimed = await redis(env, ["SET", pseudoKey(pseudo), email, "NX"]);
    if (claimed !== "OK") {
      return jsonResponse({ error: "Ce pseudo est déjà pris." }, 409);
    }

    const { hash, salt } = await hashPassword(password);
    const account = {
      email,
      prenom,
      nom,
      pseudo,
      notif,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: Date.now(),
      save: null,
      trace: null,
      badgeCount: 0,
    };
    await saveAccount(env, email, account);

    const token = randomToken();
    await redis(env, ["SET", sessionKey(token), email, "EX", String(SESSION_TTL_SECONDS)]);

    return jsonResponse({ token, account: publicAccount(account) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
