import {
  errorCode,
  jsonResponse,
  getSessionEmail,
  getAccount,
  saveAccount,
  hashPassword,
  verifyPassword,
  publicAccount,
} from "../_lib/auth.js";

function tokenFromRequest(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// change prénom / nom / mot de passe. L'email (clé du compte) n'est pas
// modifiable ici, et le pseudo se change via /api/set-pseudo.
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

  const prenom = body.prenom !== undefined ? String(body.prenom).trim().slice(0, 24) : undefined;
  const nom = body.nom !== undefined ? String(body.nom).trim().slice(0, 24) : undefined;
  const newPassword = body.newPassword !== undefined ? String(body.newPassword) : undefined;
  const currentPassword = String(body.currentPassword || "");

  if (prenom !== undefined && !prenom) {
    return jsonResponse({ error: "Le prénom ne peut pas être vide." }, 400);
  }
  if (nom !== undefined && !nom) {
    return jsonResponse({ error: "Le nom ne peut pas être vide." }, 400);
  }
  if (newPassword !== undefined && newPassword.length < 4) {
    return jsonResponse({ error: "Le nouveau mot de passe doit faire au moins 4 caractères." }, 400);
  }

  try {
    const email = await getSessionEmail(env, token);
    if (!email) return jsonResponse({ error: "Session expirée." }, 401);
    const account = await getAccount(env, email);
    if (!account) return jsonResponse({ error: "Compte introuvable." }, 404);

    if (newPassword !== undefined) {
      // changer de mot de passe demande de reconfirmer l'actuel — évite qu'un
      // jeton de session volé suffise à verrouiller le vrai propriétaire dehors
      const ok = await verifyPassword(currentPassword, account.passwordSalt, account.passwordHash);
      if (!ok) return jsonResponse({ error: "Mot de passe actuel incorrect." }, 401);
      const { hash, salt } = await hashPassword(newPassword);
      account.passwordHash = hash;
      account.passwordSalt = salt;
    }
    if (prenom !== undefined) account.prenom = prenom;
    if (nom !== undefined) account.nom = nom;

    await saveAccount(env, email, account);
    return jsonResponse({ ok: true, account: publicAccount(account) });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
