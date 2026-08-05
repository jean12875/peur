# VEILLE

Un jeu web (mobile + desktop) en cinq épreuves. Il a besoin de te voir pour commencer, et il n'oublie jamais que tu es parti.

## Le concept

Chaque partie est un gauntlet de cinq épreuves courtes et très différentes les unes des autres. Rate une épreuve, meurs, recommence tout depuis le début. Réussis les cinq, et tu survis à la nuit — pour cette fois.

1. **LE REGARD** — la caméra doit te voir de face. Détourne les yeux plus d'une demi-seconde puis reviens à l'écran : il en profite.
2. **LE SOUFFLE** — le micro écoute. Ne fais aucun bruit pendant l'épreuve (le seuil se calibre sur le bruit ambiant réel de la pièce, pour rester juste où que tu sois).
3. **LE MIROIR** — le flux caméra devient plein écran, désaturé, granuleux. Quelque chose y apparaît une fraction de seconde, une seule fois : touche l'écran à ce moment précis.
4. **L'IMMOBILITÉ** — les capteurs de mouvement du téléphone (accéléromètre) mesurent si l'appareil tremble. Ne bouge pas. Sur ordinateur, sans capteurs, c'est la souris et le clavier qui sont surveillés à la place : ne touche à rien.
5. **DERRIÈRE TOI** — un bouton pour te retourner. Ce qu'il y a derrière est aléatoire (peut-être rien). Se retourner à nouveau pour te remettre face à l'écran est le seul moyen de finir la nuit — mais si quelque chose t'attendait, c'est là qu'il frappe.

En toile de fond, sur les cinq épreuves : garde ton doigt posé sur l'écran (ou `Espace` / clic sur ordinateur) pour maintenir une faible lumière de protection — lâcher ou paniquer fait toujours grimper la menace, quelle que soit l'épreuve en cours.

Ce qui rend VEILLE inhabituel :

- **Cinq mécaniques radicalement différentes** dans une seule partie de 60 à 90 secondes — regard, ouïe, réflexe, immobilité physique, puis un choix — plutôt qu'une seule boucle répétée.
- **La caméra (et si possible le micro et les capteurs) comme condition d'entrée.** Le bouton "entrer" ne lance rien tant que la caméra n'est pas autorisée. Micro et capteurs de mouvement sont "best effort" : s'ils manquent ou sont refusés, l'épreuve correspondante se termine simplement sans juger plutôt que de bloquer le jeu.
- **Tout tourne en local.** La détection de visage (face-api.js + TinyFaceDetector, ~200 Ko, hébergés dans le repo) et l'analyse du micro (Web Audio `AnalyserNode`) s'exécutent entièrement dans le navigateur. Rien n'est envoyé ni enregistré.
- **Calibration automatique.** Les seuils de bruit et de mouvement s'ajustent sur les 700 premières millisecondes de chaque épreuve, pour ne pas punir quelqu'un dans une pièce naturellement bruyante ou sur un téléphone plus sensible qu'un autre.
- **Le jeu se souvient de toi entre les sessions** (deuxième métrique de dread indépendante du run en cours) : reviens dans 3 jours, la partie démarre déjà un peu plus tendue.
- **Regarder ailleurs de l'appli (changer d'onglet) coûte cher aussi**, et coupe la caméra automatiquement (vie privée) — elle se rallume seule à ton retour si la partie continue.
- **Jumpscares frontaux** : visage géant, aberration chromatique, tremblement d'écran, son dur, vibration — avec un toggle "réduire les effets" (en haut à gauche) qui respecte aussi `prefers-reduced-motion`.
- **Réussir n'est jamais confortable.** Même la nuit survécue se termine sur un dernier frisson avant de repartir.

## Structure du repo

```
index.html      → tout le jeu (HTML + CSS + JS, un seul fichier)
manifest.json   → PWA : installable sur téléphone comme une vraie app
sw.js           → service worker, jeu jouable hors-ligne une fois chargé
icons/          → icônes générées (192, 512, apple-touch-icon)
lib/            → face-api.js (détection de visage), hébergé localement
models/         → poids du modèle TinyFaceDetector (~200 Ko), hébergés localement
```

Aucune build step, aucun framework. Audio synthétisé en direct (Web Audio API), visuels en Canvas 2D, détection de visage via un petit réseau de neurones exécuté dans le navigateur (TensorFlow.js, embarqué dans face-api.js), analyse micro via `AnalyserNode`, mouvement via `DeviceMotionEvent`. Tout est hébergé dans le repo (pas de CDN externe au runtime).

## Lancer en local

⚠️ Caméra et micro (`getUserMedia`) exigent un contexte sécurisé : `https://` ou `localhost`. Un double-clic sur `index.html` (`file://`) ne suffira pas pour tester les épreuves.

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

Pour tester sur téléphone (caméra + micro + capteurs de mouvement), le plus fiable est de publier sur GitHub Pages (https natif) et d'ouvrir le lien depuis le téléphone — l'IP locale de ton PC en `http://` ne sera pas reconnue comme un contexte sécurisé par la plupart des navigateurs mobiles.

## Publier sur GitHub Pages

1. Pousse ces fichiers (y compris `lib/` et `models/`) à la racine du repo `peur`, branche `main`.
2. Dans **Settings → Pages**, source `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le jeu sera servi sur `https://<ton-pseudo>.github.io/peur/` — https natif, caméra/micro/capteurs fonctionneront.
4. Sur téléphone, "Ajouter à l'écran d'accueil" installe VEILLE comme une vraie app.

## Note sur l'épreuve "L'Immobilité"

Le seuil de tremblement de l'accéléromètre est calibré automatiquement mais n'a pas pu être testé sur un vrai téléphone pendant le développement (environnement sans capteurs physiques). Si l'épreuve semble trop stricte ou trop permissive sur ton appareil, le seuil se règle dans `index.html`, fonction `checkStillness()` (variable `motionThreshold`).

## Vie privée

Rien n'est envoyé à un serveur : pas de backend, pas d'analytics, pas de tracking. Détection de visage et analyse audio tournent intégralement dans le navigateur. Le flux caméra/micro est coupé dès que l'onglet passe en arrière-plan, et à chaque mort ou victoire. Les seules données stockées sont locales à l'appareil (`localStorage`) : nombre de morts, nuits survécues, dernière visite, record de survie, préférences.
