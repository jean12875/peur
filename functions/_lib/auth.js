/* ============================================================
   LE TEST — helpers backend (Cloudflare Pages Functions + Upstash)
   Ce fichier n'est pas une route (préfixe "_"), juste une lib partagée.
   ============================================================ */

// Session valable 90 jours.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;

// Code de récupération de mot de passe valable 10 minutes.
const RESET_CODE_TTL_SECONDS = 60 * 10;

// Appelle l'API REST d'Upstash Redis avec une commande (tableau).
// Doc : https://upstash.com/docs/redis/features/restapi
async function redis(env, command) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("UPSTASH_NOT_CONFIGURED");
  }
  // l'URL REST Upstash ne doit pas avoir de "/" final — on le retire au cas où
  const base = String(env.UPSTASH_REDIS_REST_URL).replace(/\/+$/, "");
  let res;
  try {
    res = await fetch(base, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
  } catch (e) {
    throw new Error("UPSTASH_FETCH_FAILED: " + e.message);
  }
  const bodyText = await res.text();
  let data;
  try {
    data = JSON.parse(bodyText);
  } catch (e) {
    throw new Error("UPSTASH_BAD_RESPONSE_" + res.status + ": " + bodyText.slice(0, 200));
  }
  if (!res.ok) {
    throw new Error("UPSTASH_REQUEST_FAILED_" + res.status + ": " + (data.error || bodyText.slice(0, 200)));
  }
  if (data.error) throw new Error("UPSTASH_ERROR: " + data.error);
  return data.result;
}

// Traduit une erreur interne en petit code stable, sans jamais exposer le
// détail technique brut au joueur — utile pour signaler un bug précisément
// sans publier de token, d'URL ou de message d'erreur interne.
function errorCode(e) {
  const msg = String((e && e.message) || e || "");
  if (msg.startsWith("UPSTASH_NOT_CONFIGURED")) return "CONF";
  if (msg.startsWith("UPSTASH_FETCH_FAILED")) return "NET";
  const badRes = msg.match(/^UPSTASH_BAD_RESPONSE_(\d+)/);
  if (badRes) return "RES-" + badRes[1];
  const reqFail = msg.match(/^UPSTASH_REQUEST_FAILED_(\d+)/);
  if (reqFail) return "REQ-" + reqFail[1];
  if (msg.startsWith("UPSTASH_ERROR")) return "DB";
  if (msg.startsWith("SMS_")) return "SMS";
  return "UNK";
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function accountKey(phone) {
  return "letest:account:" + normalizePhone(phone);
}

function sessionKey(token) {
  return "letest:session:" + token;
}

// pseudo public, unique — clé séparée pour vérifier/réserver l'unicité
// (insensible à la casse : "Clovis" et "clovis" sont le même pseudo)
function pseudoKey(pseudo) {
  return "letest:pseudo:" + String(pseudo || "").trim().toLowerCase();
}

function resetCodeKey(phone) {
  return "letest:resetcode:" + normalizePhone(phone);
}

// classements — un sorted set par critère, jamais indexé par téléphone
// (le pseudo public sert de membre, jamais le numéro)
const LB_KEYS = {
  badges: "letest:lb:badges",
  playtime: "letest:lb:playtime",
  games: "letest:lb:games",
};

function validatePseudo(pseudo) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(String(pseudo || ""));
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function randomToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

// code numérique à 6 chiffres pour la récupération de mot de passe par SMS
function randomCode6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuf(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  return arr.buffer;
}

// Dérivation PBKDF2-SHA256, 100000 itérations (le maximum autorisé par le
// runtime Workers de Cloudflare — au-delà, crypto.subtle.deriveBits refuse) —
// jamais de mot de passe en clair stocké.
async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBuf(saltHex) : crypto.getRandomValues(new Uint8Array(16)).buffer;
  const saltOut = saltHex || bufToHex(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return { hash: bufToHex(bits), salt: saltOut };
}

async function verifyPassword(password, saltHex, expectedHashHex) {
  const { hash } = await hashPassword(password, saltHex);
  // comparaison en temps constant, pour rester honnête même si l'enjeu est faible ici
  if (hash.length !== expectedHashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  return diff === 0;
}

async function getSessionPhone(env, token) {
  if (!token) return null;
  const phone = await redis(env, ["GET", sessionKey(token)]);
  return phone || null;
}

async function getAccount(env, phone) {
  const raw = await redis(env, ["GET", accountKey(phone)]);
  return raw ? JSON.parse(raw) : null;
}

async function saveAccount(env, phone, account) {
  await redis(env, ["SET", accountKey(phone), JSON.stringify(account)]);
}

// met à jour les 3 classements pour un compte donné (silencieux si pas de
// pseudo — un compte sans pseudo n'apparaît jamais dans un classement)
async function updateLeaderboards(env, account) {
  if (!account.pseudo) return;
  const badgeCount = Number(account.badgeCount || 0);
  const totalPlayMs = Number((account.trace && account.trace.totalPlayMs) || 0);
  const gamesRecorded = Number((account.trace && account.trace.gamesRecorded) || 0);
  await Promise.all([
    redis(env, ["ZADD", LB_KEYS.badges, String(badgeCount), account.pseudo]),
    redis(env, ["ZADD", LB_KEYS.playtime, String(totalPlayMs), account.pseudo]),
    redis(env, ["ZADD", LB_KEYS.games, String(gamesRecorded), account.pseudo]),
  ]);
}

// envoie un SMS via l'API Twilio — nécessite TWILIO_ACCOUNT_SID,
// TWILIO_AUTH_TOKEN et TWILIO_FROM_NUMBER en variables d'environnement
async function sendSms(env, toPhone, body) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    throw new Error("SMS_NOT_CONFIGURED");
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const form = new URLSearchParams();
  form.set("From", env.TWILIO_FROM_NUMBER);
  form.set("To", toPhone);
  form.set("Body", body);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
  } catch (e) {
    throw new Error("SMS_FETCH_FAILED: " + e.message);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("SMS_SEND_FAILED_" + res.status + ": " + text.slice(0, 200));
  }
}

function publicAccount(account) {
  return {
    prenom: account.prenom,
    nom: account.nom,
    pseudo: account.pseudo || null,
    needsPseudo: !account.pseudo,
    notif: !!account.notif,
    save: account.save || null,
    trace: account.trace || null,
  };
}

export {
  SESSION_TTL_SECONDS,
  RESET_CODE_TTL_SECONDS,
  redis,
  errorCode,
  normalizePhone,
  accountKey,
  sessionKey,
  pseudoKey,
  resetCodeKey,
  LB_KEYS,
  validatePseudo,
  jsonResponse,
  randomToken,
  randomCode6,
  hashPassword,
  verifyPassword,
  getSessionPhone,
  getAccount,
  saveAccount,
  updateLeaderboards,
  sendSms,
  publicAccount,
};
