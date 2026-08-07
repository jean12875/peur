import { redis, errorCode, LB_KEYS, jsonResponse, getSessionEmail, getAccount } from "../_lib/auth.js";

function tokenFromRequest(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// classement réservé aux joueurs connectés — l'API elle-même vérifie la
// session, pas seulement l'interface, pour que ça reste vrai même en direct
export async function onRequestGet(context) {
  const { request, env } = context;
  const token = tokenFromRequest(request);
  if (!token) return jsonResponse({ error: "Non connecté." }, 401);

  const url = new URL(request.url);
  const by = url.searchParams.get("by");
  const key = LB_KEYS[by] || LB_KEYS.badges;

  try {
    const email = await getSessionEmail(env, token);
    if (!email) return jsonResponse({ error: "Session expirée." }, 401);
    const account = await getAccount(env, email);
    if (!account) return jsonResponse({ error: "Compte introuvable." }, 404);

    // top 20, du plus haut score au plus bas
    const raw = await redis(env, ["ZREVRANGE", key, "0", "19", "WITHSCORES"]);
    const entries = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ pseudo: raw[i], score: Number(raw[i + 1]) || 0 });
    }

    let me = null;
    if (account.pseudo) {
      const rank = await redis(env, ["ZREVRANK", key, account.pseudo]);
      const score = await redis(env, ["ZSCORE", key, account.pseudo]);
      if (rank !== null && rank !== undefined) {
        me = { pseudo: account.pseudo, rank: Number(rank) + 1, score: Number(score) || 0 };
      }
    }

    return jsonResponse({ entries, me, needsPseudo: !account.pseudo });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
