import {
  RESET_CODE_TTL_SECONDS,
  redis,
  errorCode,
  normalizePhone,
  resetCodeKey,
  jsonResponse,
  randomCode6,
  getAccount,
  sendSms,
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
  if (phone.length < 6) {
    return jsonResponse({ error: "Numéro de téléphone invalide." }, 400);
  }

  try {
    const account = await getAccount(env, phone);
    // réponse identique que le compte existe ou non — on n'expose pas
    // publiquement quels numéros sont enregistrés
    if (!account) {
      return jsonResponse({ ok: true });
    }

    const code = randomCode6();
    await redis(env, ["SET", resetCodeKey(phone), code, "EX", String(RESET_CODE_TTL_SECONDS)]);
    await sendSms(env, phone, `LE TEST — ton code de récupération : ${code} (valable 10 minutes).`);

    return jsonResponse({ ok: true });
  } catch (e) {
    if (String(e.message).startsWith("UPSTASH_NOT_CONFIGURED")) {
      return jsonResponse({ error: "Le compte en ligne n'est pas encore configuré sur ce déploiement." }, 503);
    }
    if (String(e.message).startsWith("SMS_NOT_CONFIGURED")) {
      return jsonResponse({ error: "L'envoi de SMS n'est pas encore configuré sur ce déploiement." }, 503);
    }
    return jsonResponse({ error: "Erreur serveur.", code: errorCode(e) }, 500);
  }
}
