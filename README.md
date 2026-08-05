# VEILLE

Un jeu web (mobile + desktop) qui a besoin de te voir pour commencer — et qui n'oublie jamais que tu es parti.

## Le concept

Pas de héros, pas d'inventaire, pas de boutons compliqués. Deux règles :

1. **Il doit pouvoir te voir.** La caméra est obligatoire pour lancer une partie — sans elle, le jeu ne démarre pas. Si tu détournes le regard puis reviens à l'écran, ça compte : quelque chose t'a vu faire.
2. **Garde ton doigt posé sur l'écran** (ou maintiens `Espace` / le clic sur ordinateur). Tant que tu tiens, une faible lumière te protège. Lâcher, ou paniquer et tapoter trop vite, laisse quelque chose s'approcher.

Ce qui rend VEILLE inhabituel :

- **La caméra comme condition d'entrée.** Le bouton "entrer" ne lance rien tant que tu n'as pas autorisé la caméra — c'est en partie de la fiction (il "ouvre les yeux"), en partie une vraie mécanique de jeu.
- **Regard détecté en local, jamais transmis.** Un petit modèle de détection de visage (face-api.js + TinyFaceDetector, ~200 Ko, hébergé dans le repo) tourne entièrement dans le navigateur, plusieurs fois par seconde, pour savoir si un visage te fait face. Rien n'est envoyé nulle part, rien n'est enregistré — juste une image analysée puis jetée, en boucle.
- **Détourner le regard, puis revenir : scream.** Le jeu ne réagit pas quand tu regardes ailleurs — c'est ton retour qui compte. Regarde ailleurs plus d'une demi-seconde, reviens à l'écran, et il t'attend.
- **"Se retourner", une fois par partie.** À un moment aléatoire, un bouton discret apparaît. En appuyant, la scène bascule vers "l'arrière" — parfois vide, parfois pas. Se retourner à nouveau pour se remettre face à l'écran déclenche systématiquement un jumpscare, qu'il y ait eu quelque chose ou non.
- **Tenir, pas taper.** Le réflexe horreur classique (spammer un bouton) est puni : plus tu t'agites, plus la menace grandit.
- **Le jeu se souvient de toi entre les sessions.** Il stocke localement (`localStorage`) la date de ta dernière visite. Reviens dans 3 jours, et la partie démarre déjà dans le danger.
- **Regarder ailleurs de l'appli (changer d'onglet) coûte cher aussi.** La caméra se coupe automatiquement quand l'onglet passe en arrière-plan (vie privée), et le temps passé loin fait avancer la menace.
- **Fausses interfaces système, jumpscares frontaux.** Visage géant, aberration chromatique, tremblement d'écran, son dur, vibration forte au moment fatal — avec un toggle "réduire les effets" (en haut à gauche) pour le confort, qui respecte aussi `prefers-reduced-motion`.
- **Ça ne se termine jamais vraiment.** Pas de victoire, juste des morts comptabilisées et un titre qui se dégrade à mesure que le compteur augmente.

## Structure du repo

```
index.html      → tout le jeu (HTML + CSS + JS, un seul fichier)
manifest.json   → PWA : installable sur téléphone comme une vraie app
sw.js           → service worker, jeu jouable hors-ligne une fois chargé
icons/          → icônes générées (192, 512, apple-touch-icon)
lib/            → face-api.js (détection de visage), hébergé localement
models/         → poids du modèle TinyFaceDetector (~200 Ko), hébergés localement
```

Aucune build step, aucun framework. L'audio est synthétisé en direct (Web Audio API), les visuels sont dessinés en Canvas 2D, et la détection de visage tourne via un petit réseau de neurones exécuté dans le navigateur (TensorFlow.js, embarqué dans face-api.js). La lib et le modèle sont hébergés dans le repo (pas de CDN externe) pour que ça marche aussi hors-ligne une fois installé.

## Lancer en local

⚠️ La caméra (`getUserMedia`) exige un contexte sécurisé : `https://` ou `localhost`. Un simple double-clic sur `index.html` (`file://`) ne suffira pas pour tester la mécanique du regard.

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

Sur téléphone (même Wi-Fi que ton PC), utilise l'IP locale de ton PC plutôt que `localhost` — mais attention, `http://192.168.x.x:8080` n'est **pas** un contexte sécurisé pour la caméra sur la plupart des navigateurs mobiles. Pour tester sur téléphone avant publication, le plus fiable reste de pousser sur GitHub Pages (https natif) et d'ouvrir le lien depuis le téléphone.

## Publier sur GitHub Pages

1. Pousse ces fichiers (y compris `lib/` et `models/`) à la racine du repo `peur`, branche `main`.
2. Dans **Settings → Pages**, source `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le jeu sera servi sur `https://<ton-pseudo>.github.io/peur/` — https natif, la caméra fonctionnera.
4. Sur téléphone, "Ajouter à l'écran d'accueil" installe VEILLE comme une vraie app.

## Vie privée

Rien n'est envoyé à un serveur : pas de backend, pas d'analytics, pas de tracking. La détection de visage tourne intégralement dans le navigateur (aucune image ni aucune donnée de caméra ne quitte l'appareil). Le flux caméra est coupé dès que l'onglet passe en arrière-plan, et à chaque mort. Les seules données stockées sont locales à l'appareil (`localStorage`) : nombre de morts, dernière visite, record de survie, préférences.
