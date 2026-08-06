/* ============================================================
   LE TEST — helpers backend (Cloudflare Pages Functions + Upstash)
   Ce fichier n'est pas une route (préfixe "_"), juste une lib partagée.
   ============================================================ */

// Session valable 90 jours.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;

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

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function accountKey(phone) {
  return "letest:account:" + normalizePhone(phone);
}

function sessionKey(token) {
  return "letest:session:" + token;
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

function publicAccount(account) {
  return {
    prenom: account.prenom,
    nom: account.nom,
    notif: !!account.notif,
    save: account.save || null,
    trace: account.trace || null,
  };
}

export {
  SESSION_TTL_SECONDS,
  redis,
  normalizePhone,
  accountKey,
  sessionKey,
  jsonResponse,
  randomToken,
  hashPassword,
  verifyPassword,
  getSessionPhone,
  getAccount,
  saveAccount,
  publicAccount,
};
