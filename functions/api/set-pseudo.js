import {
  redis,
  errorCode,
  pseudoKey,
  validatePseudo,
  jsonResponse,
  getSessionPhone,
  getAccount,
  saveAccount,
  publicAccount,
} from "../_lib/auth.js";

function tokenFromRequest(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// utilisé pour les comptes créés avant l'introduction du pseudo public
// (permet aussi de changer son pseudo plus tard, depuis "changer mes infos")
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

  const pseudo = String(body.pseudo || "").trim();
  if (!validatePseudo(pseudo)) {
    return jsonResponse({ error: "Le pseudo doit faire 3 à 20 caractères (lettres, chiffres, underscore)." }, 400);
  }

  try {
    const phone = await getSessionPhone(env, token);
    if (!phone) return jsonResponse({ error: "Session expirée." }, 401);
    const account = await getAccount(env, phone);
    if (!account) return jsonResponse({ error: "Compte introuvable." }, 404);

    if (account.pseudo && account.pseudo.toLowerCase() === pseudo.toLowerCase()) {
      return jsonResponse({ ok: true, account: publicAccount(account) });
    }

    const claimed = await redis(env, ["SET", pseudoKey(pseudo), phone, "NX"]);
    if (claimed !== "OK") {
      return jsonResponse({ error: "Ce pseudo est déjà pris." }, 409);
    }
    // libère l'ancien pseudo, s'il y en avait un — non bloquant
    if (account.pseudo) {
      try { await redis(env, ["DEL", pseudoKey(account.pseudo)]); } catch (e) {}
    }
    account.pseudo = pseudo;
    await saveAccount(env, phone, account);

    return jsonResponse({ ok: true, account: publicAccount(account) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
