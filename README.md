# LE TEST

Un jeu web (mobile + desktop). Une salle capitonnée. Un vieux téléviseur. Deux boutons : OUI, NON. Réponds sincèrement.

## Le concept

Tu es assis face à un téléviseur, dans une pièce qui ressemble à une salle d'isolement. Le téléviseur pose des questions, une par une. Tu réponds OUI ou NON en appuyant sur l'un des deux gros boutons reliés à l'appareil par un fil. C'est tout — pas d'inventaire, pas de déplacement, pas de mécanique compliquée.

Les premières questions sont cliniques, presque rassurantes ("Es-tu vivant ?", "Comprends-tu ce qu'on te demande ?"). Puis elles commencent à savoir des choses qu'elles ne devraient pas savoir (l'heure réelle, la batterie réelle de ton appareil, ta position réelle). Puis elles commencent à mentir sur ce que tu as répondu avant. Puis elles deviennent des questions auxquelles il n'y a pas de bonne réponse — et une, à un moment donné, exige simplement que tu te taises.

Comment tu réponds compte : le jeu retient discrètement si tu es plutôt conciliant ou plutôt curieux/récalcitrant, et la toute dernière question détermine laquelle des deux fins tu obtiens.

Ce qui rend LE TEST inhabituel :

- **Une seule mécanique, aucune distraction.** Pas de minuteur à gérer, pas de doigt à maintenir sur l'écran — juste des questions, une par une, et le poids de devoir y répondre.
- **Le test ment.** Certaines questions prétendent que tu as déjà répondu différemment, ou remettent en cause ta version précédente — alors que ce n'est pas vrai. Le doute est le but.
- **Il sait vraiment des choses sur toi.** L'heure, la batterie de ton appareil, ta position GPS réelle — affichées telles quelles, sans détour. Une caméra te filme en permanence dans un coin de l'écran. Un micro écoute une question où il te faut rester silencieux — et le jeu entend si tu échoues. Une vraie notification système arrive au pire moment.
- **Aucune bonne réponse n'est mise en scène pour toi.** Pas de jumpscare. Une réponse "étrange" fait trembler l'écran, le teinte de rouge, corrompt le texte — jamais un cri, jamais un visage qui surgit.
- **Deux fins, déterminées par tes choix**, pas par un mini-jeu de réflexes : une fin silencieuse et froide si tu restes conciliant, une fin qui s'effondre lentement dans le glitch et le noir si ta curiosité l'emporte.
- **La mémoire entre les sessions.** Le jeu se souvient du nombre de fois où tu es venu et depuis combien de temps, et l'écran-titre le formule froidement.

## Permissions — tout ou rien, sans mise en scène

Avant de commencer, le jeu demande caméra, microphone, géolocalisation, capteurs de mouvement (iOS) et notifications, un rond par permission. Chaque rond ne devient vert que si une vraie demande native a réellement été montrée et acceptée — jamais de faux "accordé" silencieux. Sur un appareil où une permission ne peut tout simplement pas être proposée (ex : notifications sur Safari iOS hors écran d'accueil), le rond reste rouge et le jeu ne démarre pas tant que ce n'est pas résolu — c'est volontaire. Le gros bouton central ne s'active qu'une fois tous les ronds verts.

Sur certains navigateurs Android compatibles avec le *Contact Picker*, un rond supplémentaire apparaît : il ouvre le sélecteur de contacts natif du téléphone, et si tu choisis un contact, le jeu peut ensuite le mentionner.

Utilisation réelle en jeu :

- **Caméra** : flux vidéo affiché en permanence dans un coin de l'écran (aperçu en niveaux de gris), coupé automatiquement si l'onglet passe en arrière-plan et entre deux sessions.
- **Microphone** : analysé en direct pour une question qui demande le silence — un bruit détecté au-dessus d'un seuil calibré sur le bruit ambiant déclenche une réaction du jeu.
- **Géolocalisation** : coordonnées GPS réelles affichées brutes dans une question — jamais géocodées, pour ne jamais avoir besoin d'un appel réseau externe.
- **Notifications** : une vraie notification système est envoyée au moment le plus fort du test (via le service worker, pour que ça fonctionne aussi sur mobile).
- **Mouvement (iOS)** : demandé pour cohérence avec le reste du dispositif.
- **Contacts (bonus, si disponible)** : sélectionne un nom réel dans les contacts de l'appareil pour une question ciblée.

## Le nom

Tôt dans le test, l'écran demande le prénom et le nom du joueur — une vraie saisie, pas une case à cocher. Ce nom est mémorisé (localement) et réutilisé dans plusieurs questions plus tard, y compris dans une ligne corrompue vers la fin. Les sessions suivantes ne le redemandent pas : l'écran-titre s'adresse directement au joueur par son nom.

## Regarder autour de soi

La pièce est une vraie géométrie en 3D (quatre plans assemblés avec `perspective` + `transform-style: preserve-3d` en CSS) : mur avant avec le téléviseur, mur gauche avec un lit, mur droit avec une porte sans poignée surveillée par une petite caméra au plafond (LED rouge qui clignote), et un sol. Glisser le doigt fait vraiment pivoter la caméra autour de son axe (jusqu'à 100° de chaque côté), avec la perspective réelle du navigateur — les murs se déforment et se rapprochent comme dans une vraie pièce, pas un décor plat qui glisse. Le rendu est calé sur le rafraîchissement de l'écran (une seule mise à jour par frame, capture de pointeur) pour rester fluide même sur un téléphone modeste.

Deux inscriptions différentes griffonnées sur les murs latéraux ne sont visibles qu'en tournant la tête. Ce n'est pas un moteur 3D dédié (pas de WebGL/Three.js) — seulement les transformations 3D natives du CSS — pour rester léger et fiable sur mobile.

## Escalade

Une réponse "inattendue" fait trembler l'écran et le teinte de rouge — l'intensité de cette réaction grandit avec la progression du test (secousse plus forte, rouge plus profond, son plus dur en fin de partie). Une séquence dédiée transforme brièvement toute la pièce en blanc immaculé, avec une musique étrange et légèrement désaccordée, avant de basculer brutalement dans le rouge. Aucun jumpscare classique nulle part : tout reste ambiance et rupture de rythme, jamais un visage qui surgit.

## Structure du repo

```
index.html      → tout le jeu (HTML + CSS + JS, un seul fichier)
manifest.json   → PWA : installable sur téléphone comme une vraie app
sw.js           → service worker, jeu jouable hors-ligne une fois chargé
icons/          → icônes générées (192, 512, apple-touch-icon)
```

Aucune build step, aucun framework, aucune dépendance externe. L'audio est entièrement synthétisé (Web Audio API). Les visuels combinent Canvas 2D (ambiance de la pièce, grain, glimpses brefs) et DOM/CSS (le téléviseur et son texte, pour un rendu net et lisible).

## Lancer en local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

Un contexte sécurisé (`localhost` ou HTTPS) est nécessaire cette fois : caméra, micro et géolocalisation exigent tous `https://` ou `http://localhost` — un simple double-clic sur `index.html` (`file://`) ne suffira pas.

## Publier sur GitHub Pages

1. Pousse ces fichiers à la racine du repo `peur`, branche `main`.
2. Dans **Settings → Pages**, source `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le jeu sera servi sur `https://<ton-pseudo>.github.io/peur/` — HTTPS par défaut, donc les permissions fonctionneront normalement.
4. Sur téléphone, "Ajouter à l'écran d'accueil" installe LE TEST comme une vraie app.

## Vie privée

Rien n'est envoyé à un serveur : pas de backend, pas d'analytics, pas de tracking. Caméra et micro tournent entièrement en local dans le navigateur, jamais transmis ni enregistrés ; le flux caméra est coupé dès que l'onglet est masqué ou que la session se termine. La position GPS est affichée brute, jamais géocodée ni envoyée à un service tiers. Les seules données stockées sont locales à l'appareil (`localStorage`) : nombre de tests passés, dernière visite, nombre de mauvaises fins, préférences d'affichage.

## Historique

Ce repo a d'abord contenu deux versions précédentes du jeu (mécanique "tenir l'écran" avec caméra obligatoire, puis un gauntlet en cinq épreuves). Cette version est une refonte complète autour d'un concept différent : l'interrogatoire psychologique plutôt que la survie en temps réel. Les fichiers `lib/` et `models/` (détection de visage) des versions précédentes ne sont plus utilisés.
