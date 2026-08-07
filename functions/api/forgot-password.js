import {
  RESET_CODE_TTL_SECONDS,
  redis,
  errorCode,
  normalizeEmail,
  validateEmail,
  resetCodeKey,
  jsonResponse,
  randomCode6,
  getAccount,
  sendEmail,
} from "../_lib/auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Requête invalide." }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!validateEmail(email)) {
    return jsonResponse({ error: "Adresse email invalide." }, 400);
  }

  try {
    const account = await getAccount(env, email);
    // réponse identique que le compte existe ou non — on n'expose pas
    // publiquement quels emails sont enregistrés
    if (!account) {
      return jsonResponse({ ok: true });
    }

    const code = randomCode6();
    await redis(env, ["SET", resetCodeKey(email), code, "EX", String(RESET_CODE_TTL_SECONDS)]);
    await sendEmail(
      env,
      email,
      "LE TEST PSYCHOLOGIQUE — code de récupération",
      `Ton code de récupération : ${code}\n\nValable 10 minutes. Si tu n'es pas à l'origine de cette demande, ignore cet email.`
    );

    return jsonResponse({ ok: true });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    if (String(e.message).startsWith("EMAIL_NOT_CONFIGURED")) {
      return jsonResponse({ error: "L'envoi d'email n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
