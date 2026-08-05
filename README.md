# LE TEST

Un jeu web (mobile + desktop). Une salle capitonnée. Un vieux téléviseur. Deux boutons : OUI, NON. Réponds sincèrement.

## Le concept

Tu es assis face à un téléviseur, dans une pièce qui ressemble à une salle d'isolement. Le téléviseur pose des questions, une par une. Tu réponds OUI ou NON en appuyant sur l'un des deux gros boutons reliés à l'appareil par un fil. C'est tout — pas d'inventaire, pas de déplacement, pas de mécanique compliquée.

Les premières questions sont cliniques, presque rassurantes ("Es-tu vivant ?", "Comprends-tu ce qu'on te demande ?"). Puis elles commencent à savoir des choses qu'elles ne devraient pas savoir (l'heure réelle, la batterie réelle de ton appareil, ta position réelle). Puis elles commencent à mentir sur ce que tu as répondu avant. Puis elles deviennent des questions auxquelles il n'y a pas de bonne réponse — et une, à un moment donné, exige simplement que tu te taises.

Comment tu réponds compte : le jeu retient discrètement si tu es plutôt conciliant ou plutôt curieux/récalcitrant, et la toute dernière question détermine laquelle des deux fins tu obtiens.

Ce qui rend LE TEST inhabituel :

- **Une seule mécanique, aucune distraction.** Pas de minuteur à gérer, pas de doigt à maintenir sur l'écran — juste des questions, une par une, et le poids de devoir y répondre.
- **Le test ment.** Certaines questions prétendent que tu as déjà répondu différemment, ou remettent en cause ta version précédente — alors que ce n'est pas vrai. Le doute est le but.
- **Il sait vraiment des choses sur toi.** L'heure réelle, la batterie réelle de ton appareil, ton prénom et ton nom — affichés telles quels, sans détour. Une vraie notification système arrive au pire moment.
- **Aucune bonne réponse n'est mise en scène pour toi.** Pas de jumpscare. Une réponse "étrange" fait trembler l'écran, le teinte de rouge, corrompt le texte — jamais un cri, jamais un visage qui surgit.
- **Deux fins, déterminées par tes choix**, pas par un mini-jeu de réflexes : une fin silencieuse et froide si tu restes conciliant, une fin qui s'effondre lentement dans le glitch et le noir si ta curiosité l'emporte.
- **La mémoire entre les sessions.** Le jeu se souvient du nombre de fois où tu es venu et depuis combien de temps, et l'écran-titre le formule froidement.

## Avant de commencer : formulaire + notifications

La porte d'entrée demande deux choses, dans le même écran : ton prénom et ton nom (un vrai formulaire, deux champs), et l'autorisation d'envoyer des notifications. Le gros bouton central ne s'active que lorsque les deux champs sont remplis et que la permission a été explicitement accordée — jamais de faux "accordé" silencieux. Sur un appareil où les notifications ne peuvent tout simplement pas être proposées (ex : Safari iOS hors écran d'accueil), le rond reste rouge et le jeu ne démarre pas tant que ce n'est pas résolu — c'est volontaire.

Une vraie notification système est envoyée au moment le plus fort du test (via le service worker, pour que ça fonctionne aussi sur mobile).

## Le nom

Le prénom et le nom, saisis avant le lancement, sont mémorisés (localement) et réutilisés dans plusieurs questions tout au long du test, y compris dans une ligne corrompue vers la fin. Les sessions suivantes pré-remplissent le formulaire : l'écran-titre s'adresse directement au joueur par son nom.

## La pièce

Une salle capitonnée blanche, vue de face, fixe : le téléviseur, les boutons et les fils sont toujours à la même place. Une inscription grattée dans le mur est visible en permanence dans un coin. (Un mécanisme pour regarder autour de soi en glissant le doigt a été tenté puis abandonné — la composition 3D du CSS s'est révélée trop fragile à ajuster sans aperçu visuel direct dans l'environnement de développement, et le rendu obtenu était cassé plutôt que convaincant. Mieux vaut une pièce simple et stable qu'un effet impressionnant mais buggé.)

## Le texte s'écrit, il n'apparaît pas

Chaque réplique du téléviseur s'affiche lettre par lettre, avec un petit tic sonore à chaque frappe — jamais d'un coup. Les boutons OUI/NON ne s'activent qu'une fois la phrase entièrement écrite : impossible de répondre avant d'avoir lu.

## Escalade

Une réponse "inattendue" fait trembler l'écran et le teinte de rouge — l'intensité de cette réaction grandit avec la progression du test (secousse plus forte, rouge plus profond, son plus dur en fin de partie).

Les grésillements, eux, ne sont jamais laissés au hasard : chacun est accroché à un moment précis du scénario, jamais déclenché en dehors de ces instants-là. L'écran se couvre de statique et la pièce tremble une fois, juste après qu'on évoque un sujet précédent qui n'a pas terminé le test. Un flash bref désaligne complètement les couleurs de l'écran, comme un signal qui lâche, au moment où le protocole annonce un jugement caviardé. Un autre glitch, plus bref (une seconde pile), fait rouler et trembler le texte à l'écran dans un aller-retour statique/couleurs désalignées, quand le test insinue qu'un autre sujet a répondu à ta place.

À l'inverse, l'écran passe brièvement au vert et un petit carillon se fait entendre à deux reprises, quand une partie du test vient d'être validée — le seul moment où le téléviseur n'est pas hostile.

Une séquence dédiée transforme la pièce en blanc immaculé pendant dix bonnes secondes, avec une musique étrange et légèrement désaccordée — puis tout redevient normal, en silence, comme si de rien n'était. Aucune coupure rouge, aucune explication : c'est cette absence de suite qui dérange. Un autre moment plonge l'écran dans un noir total, avec des bruits d'opération (scie, cliquetis métalliques, un moniteur cardiaque qui finit par s'aplatir) — jamais expliqué non plus.

Le scénario distille aussi, sans jamais le dire explicitement, l'idée que ce test décide de quelque chose d'important pour le joueur : un dossier qui existait avant son arrivée, une case "VIVANT" sur une feuille, un sujet précédent qui n'a pas eu de suite, un texte partiellement caviardé. Aucun jumpscare classique nulle part : tout reste ambiance et rupture de rythme, jamais un visage qui surgit à l'écran.

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

Un contexte sécurisé (`localhost` ou HTTPS) est recommandé : les notifications exigent `https://` ou `http://localhost` — un simple double-clic sur `index.html` (`file://`) peut ne pas suffire pour cette permission.

## Publier sur GitHub Pages

1. Pousse ces fichiers à la racine du repo `peur`, branche `main`.
2. Dans **Settings → Pages**, source `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le jeu sera servi sur `https://<ton-pseudo>.github.io/peur/` — HTTPS par défaut, donc les permissions fonctionneront normalement.
4. Sur téléphone, "Ajouter à l'écran d'accueil" installe LE TEST comme une vraie app.

## Vie privée

Rien n'est envoyé à un serveur : pas de backend, pas d'analytics, pas de tracking. Le prénom et le nom saisis restent locaux à l'appareil (`localStorage`), jamais transmis. Les seules autres données stockées sont locales également : nombre de tests passés, dernière visite, nombre de mauvaises fins, préférences d'affichage.

## Historique

Ce repo a d'abord contenu deux versions précédentes du jeu (mécanique "tenir l'écran" avec caméra obligatoire, puis un gauntlet en cinq épreuves). Cette version est une refonte complète autour d'un concept différent : l'interrogatoire psychologique plutôt que la survie en temps réel. Les fichiers `lib/` et `models/` (détection de visage) des versions précédentes ne sont plus utilisés.
