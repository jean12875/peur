# VEILLE

Un jeu web (mobile + desktop) qui n'oublie jamais que tu es parti.

## Le concept

Pas de héros, pas d'inventaire, pas de boutons. Une seule règle : **garde ton doigt posé sur l'écran** (ou maintiens `Espace` / le clic sur ordinateur). Tant que tu tiens, une faible lumière te protège. Dès que tu lâches — ou que tu paniques et tapotes trop vite — quelque chose s'approche dans le noir.

Ce qui rend VEILLE inhabituel :

- **Tenir, pas taper.** Le réflexe horreur classique (spammer un bouton) est puni : plus tu t'agites, plus la menace grandit. Il faut rester calme, littéralement.
- **Le jeu se souvient de toi entre les sessions.** Il stocke localement (`localStorage`) la date de ta dernière visite. Reviens 5 minutes après, et l'accueil est neutre. Reviens dans 3 jours, et la partie démarre déjà dans le danger — l'écran d'accueil te le dit froidement.
- **Regarder ailleurs coûte cher.** Si tu changes d'onglet ou d'appli pendant une partie (Page Visibility API), le temps réel passé loin de l'écran fait avancer la menace. À ton retour, une fausse notification t'informe de ce qui s'est "passé" pendant ton absence.
- **Fausses interfaces système.** Barre de batterie, notification, petit point "REC" — tout est cosmétique, dessiné dans la page, jamais une vraie alerte de ton téléphone. Ça brouille juste la frontière entre le jeu et l'appareil.
- **Caméra optionnelle, 100 % locale.** Une fois par partie, le jeu peut te demander d'utiliser ta caméra frontale pour un effet de "surveillance". Le flux n'est **jamais transmis ni enregistré** — tout reste dans le navigateur, tu peux refuser sans rien perdre.
- **Ça ne se termine jamais vraiment.** Pas de victoire. Juste des morts comptabilisées, un record de survie, et un titre qui se dégrade visuellement (glitch, teinte, texte) à mesure que le compteur de morts augmente.

Un toggle "réduire les effets" (en haut à gauche) coupe les flashs et vibrations pour le confort / la photosensibilité ; il respecte aussi `prefers-reduced-motion` par défaut.

## Structure du repo

```
index.html      → tout le jeu (HTML + CSS + JS, un seul fichier, aucune dépendance externe)
manifest.json   → PWA : installable sur téléphone comme une vraie app
sw.js           → service worker, jeu jouable hors-ligne une fois chargé une première fois
icons/          → icônes générées (192, 512, apple-touch-icon)
```

Aucune build step, aucun framework, aucun asset externe (l'audio est synthétisé en direct via Web Audio API, les visuels sont dessinés en Canvas 2D). Ça tourne tel quel dans n'importe quel navigateur moderne.

## Lancer en local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

(Un simple double-clic sur `index.html` fonctionne aussi pour tester rapidement, mais le service worker et certaines API ont besoin d'un serveur — même local — pour bien fonctionner.)

## Publier sur GitHub Pages (repo `peur`)

1. Pousse ces fichiers à la racine du repo `peur` (branche `main`).
2. Dans **Settings → Pages**, choisis la source `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le jeu sera servi sur `https://<ton-pseudo>.github.io/peur/`.
4. Sur téléphone, ouvrir ce lien puis "Ajouter à l'écran d'accueil" installe VEILLE comme une vraie app (grâce au `manifest.json`).

## Vie privée

Rien n'est envoyé à un serveur : pas de backend, pas d'analytics, pas de tracking. Les seules données stockées sont locales à l'appareil (`localStorage`) : nombre de morts, dernière visite, record de survie, préférences. La caméra, si activée, ne sert qu'à un rendu visuel local et s'arrête dès que l'onglet passe en arrière-plan.
