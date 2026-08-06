# LE TEST

Un jeu web (mobile + desktop). Une salle capitonnée. Un vieux téléviseur. Deux boutons : OUI, NON. Réponds sincèrement.

## Le concept

Tu es assis face à un téléviseur, dans une pièce qui ressemble à une salle d'isolement. Le téléviseur pose des questions, une par une. Tu réponds OUI ou NON en appuyant sur l'un des deux gros boutons reliés à l'appareil par un fil. C'est tout — pas d'inventaire, pas de déplacement, pas de mécanique compliquée.

Les premières questions sont cliniques, presque rassurantes ("Es-tu vivant ?", "Comprends-tu ce qu'on te demande ?"). Puis elles commencent à savoir des choses qu'elles ne devraient pas savoir (l'heure réelle, la batterie réelle de ton appareil, ta position réelle). Puis elles commencent à mentir sur ce que tu as répondu avant. Puis elles deviennent des questions auxquelles il n'y a pas de bonne réponse — et une, à un moment donné, exige simplement que tu te taises.

Comment tu réponds compte, vraiment : le jeu suit en secret plusieurs axes psychologiques à la fois (jamais un simple "trait dominant" isolé), et ces axes combinés choisissent à deux reprises quelles questions tu vois ensuite — puis, tout à la fin, laquelle des huit fins tu obtiens. Peu importe le chemin, chaque partie doit rester cohérente avec ce que tu as réellement répondu.

Ce qui rend LE TEST inhabituel :

- **Une seule mécanique, aucune distraction.** Pas de minuteur à gérer, pas de doigt à maintenir sur l'écran — juste des questions, une par une, et le poids de devoir y répondre.
- **Le test ment.** Certaines questions prétendent que tu as déjà répondu différemment, ou remettent en cause ta version précédente — alors que ce n'est pas vrai. Le doute est le but.
- **Il sait vraiment des choses sur toi.** L'heure réelle, la batterie réelle de ton appareil, ton prénom et ton nom — affichés telles quels, sans détour. De vraies notifications système arrivent à des moments choisis pendant la partie — jamais pendant un moment écran rouge ou le monstre, pour ne pas couper le son en cours.
- **Presque aucune bonne réponse n'est mise en scène pour toi.** Une réponse "étrange" fait trembler l'écran, corrompt le texte, fait basculer le téléviseur en rouge et grésillement — l'essentiel du jeu reste ambiance et rupture de rythme plutôt que jumpscare. Une seule exception, une seule fois par partie : un vrai face-à-face, bref et net, accompagné d'un son pensé pour faire peur.
- **Un profil psychologique caché, à plusieurs axes.** Soumission, méfiance, lucidité, dissociation — quatre scores qui montent et descendent en secret selon chaque réponse, jamais affichés au joueur, jamais réduits à un seul "type" de joueur. Voir la section dédiée plus bas.
- **Deux vraies bifurcations, huit fins.** Pas un simple mini-jeu de réflexes : à deux moments du test, jamais annoncés, le jeu choisit parmi quatre directions de questions selon le profil du joueur — et la combinaison finale des quatre axes (plus le nombre de réponses "inattendues") détermine laquelle des huit fins arrive.
- **La mémoire entre les sessions — et même après un reset.** Le jeu se souvient du nombre de fois où tu es venu, depuis combien de temps, et des fins déjà vécues ; certaines questions ne sont même visibles qu'après avoir déjà obtenu une fin précise lors d'une partie antérieure. Le bouton "tout oublier" efface la sauvegarde visible, mais une trace séparée, jamais vidée par ce bouton, garde le souvenir des resets eux-mêmes — et ça peut ressortir.

## Avant de commencer : formulaire + notifications

La porte d'entrée demande deux choses, dans le même écran : ton prénom et ton nom (un vrai formulaire, deux champs), et l'autorisation d'envoyer des notifications. Le gros bouton central ne s'active que lorsque les deux champs sont remplis et que la permission a été explicitement accordée — jamais de faux "accordé" silencieux. Sur un appareil où les notifications ne peuvent tout simplement pas être proposées (ex : Safari iOS hors écran d'accueil), le rond reste rouge et le jeu ne démarre pas tant que ce n'est pas résolu — c'est volontaire.

## Les notifications, une vraie mécanique

Les notifications ne sont pas un simple gadget de permission : elles reviennent à trois moments distincts, toujours via le service worker (pour fonctionner aussi sur mobile), toujours accompagnées d'un petit bip électronique en deux temps différent de tout le reste du jeu — jamais le son système par défaut, jamais pendant un moment écran rouge ou le monstre (ça couperait le son en cours).

1. **Pendant la partie**, à trois moments neutres du scénario, avec un contenu qui a l'air de "rapporter" sur toi ("Le sujet ne se comporte pas comme prévu.", "Dossier mis à jour.", "Résultats en cours de transmission.").
2. **Si tu quittes l'onglet** en pleine partie : une notification arrive 20 à 32 secondes plus tard pour te faire revenir — annulée si tu reviens avant.
3. **Après la fin d'une partie** : une seule notification, 3 à 7 minutes plus tard, tant que l'onglet reste ouvert quelque part — "On t'attend."

(Limite technique honnête : sans serveur, un vrai push après fermeture complète du navigateur n'est pas possible. Ces trois mécaniques fonctionnent tant que l'onglet reste ouvert, même en arrière-plan.)

## Le nom

Le prénom et le nom, saisis avant le lancement, sont mémorisés (localement) et réutilisés dans plusieurs questions tout au long du test, y compris dans une ligne corrompue vers la fin. Les sessions suivantes pré-remplissent le formulaire : l'écran-titre s'adresse directement au joueur par son nom.

## La pièce

Une salle capitonnée blanche, vue de face, fixe : le téléviseur, les boutons et les fils sont toujours à la même place. Une inscription grattée dans le mur est visible en permanence dans un coin. (Un mécanisme pour regarder autour de soi en glissant le doigt a été tenté puis abandonné — la composition 3D du CSS s'est révélée trop fragile à ajuster sans aperçu visuel direct dans l'environnement de développement, et le rendu obtenu était cassé plutôt que convaincant. Mieux vaut une pièce simple et stable qu'un effet impressionnant mais buggé.)

## Le texte s'écrit, il n'apparaît pas

Chaque réplique du téléviseur s'affiche lettre par lettre, avec un petit tic sonore à chaque frappe — jamais d'un coup. Les boutons OUI/NON ne s'activent qu'une fois la phrase entièrement écrite : impossible de répondre avant d'avoir lu. Exception volontaire : pendant les moments écran rouge (ligne corrompue, réponse inattendue), le texte s'affiche d'un seul coup — le malaise vient là du basculement brutal, pas d'une lecture progressive.

## Escalade

Une réponse "inattendue" fait trembler l'écran — l'intensité de cette réaction grandit avec la progression du test (secousse plus forte, son plus dur en fin de partie). Ce qui était autrefois un simple texte rouge est désormais plus physique : l'écran entier bascule au rouge, se met à grésiller, et le texte devient noir sur ce fond — comme si le téléviseur lui-même dérapait, pas seulement sa police. En fin de partie, certaines de ces réactions deviennent encore plus étranges : texte façon symboles corrompus, grésillement plus dense, flash de lumière — jamais avant que le malaise ne soit déjà bien installé.

Les grésillements ambiants, eux, ne sont jamais laissés au hasard : chacun est accroché à un moment précis du scénario, jamais déclenché en dehors de ces instants-là. L'écran se couvre de statique et la pièce tremble une fois, juste après qu'on évoque un sujet précédent qui n'a pas terminé le test. Un flash bref désaligne complètement les couleurs de l'écran, comme un signal qui lâche, au moment où le protocole annonce un jugement caviardé. Un autre glitch, plus bref (une seconde pile), fait rouler et trembler le texte à l'écran dans un aller-retour statique/couleurs désalignées, quand le test insinue qu'un autre sujet a répondu à ta place.

À l'inverse, l'écran passe brièvement au vert et un petit carillon se fait entendre à deux reprises, quand une partie du test vient d'être validée — un des rares moments où le téléviseur n'est pas hostile.

Une séquence dédiée transforme la pièce en blanc immaculé pendant dix bonnes secondes, avec une musique étrange et légèrement désaccordée — puis tout redevient normal, en silence, comme si de rien n'était. Aucune coupure rouge, aucune explication : c'est cette absence de suite qui dérange. Elle ne se déclenche qu'une fois qu'on a vraiment répondu à la question qui la précède — jamais avant, pour laisser le temps de lire.

Un autre moment plonge l'écran dans un noir total pendant qu'un vrai son fourni joue en entier — un battement de cœur qui ralentit peu à peu jusqu'à l'alarme plate d'un moniteur (`sfx/heartbeat-flatline.mp3`, ~29s). Aucune voix synthétique ici : le texte passe par des sous-titres blancs, façon film, affichés par-dessus le noir en rythme avec le son ("On est en train de le perdre. Vite.", "Reste avec nous.", "On l'a perdu."), jamais expliqués, jamais revus.

Une question demande directement si tu as peur du noir. Peu importe la réponse : la lumière de la pièce coupe aussitôt après (disjoncteur, bourdonnement qui retombe) — tout s'éteint autour de toi, sauf l'écran du téléviseur, qui reste seul visible et continue de poser des questions dans le noir, jusqu'à ce que la lumière revienne.

Le scénario distille aussi, sans jamais le dire explicitement, l'idée que ce test décide de quelque chose d'important pour le joueur : un dossier qui existait avant son arrivée, une case "VIVANT" sur une feuille, un sujet précédent qui n'a pas eu de suite, un texte partiellement caviardé. La très grande majorité du jeu reste ambiance et rupture de rythme plutôt que jumpscare — à une exception près : une seule fois par partie, sur la ligne la plus dérangeante du test (celle qui prononce ton prénom), une vraie image apparaît en plein écran — pas un dessin procédural — avec un son pensé pour être aussi terrifiant que possible. Ça n'arrive qu'une fois, jamais annoncé, jamais répété.

## Le profil caché, les bifurcations et les 8 fins

Le test suit quatre axes en secret pendant toute la partie, jamais montrés au joueur, jamais réduits à un seul trait "dominant" isolé : **soumission**, **méfiance**, **lucidité**, **dissociation**. Chaque réponse à une question qui porte un `weight` fait bouger un ou plusieurs de ces axes à la fois (`nudge()` dans le script) — une seule réponse ne définit jamais tout le profil, seule l'accumulation compte.

Le test bifurque réellement à deux moments, jamais annoncés :

1. **Première bifurcation**, après la première grande section (la pièce qui s'éteint). Le jeu regarde quel axe est le plus haut à cet instant (`dominantTrait()`, avec un léger bruit aléatoire pour éviter un déterminisme parfait) et affiche l'un des quatre chapitres suivants — obéissance, paranoïa, lucidité existentielle, ou détachement — chacun écrit avec un ton différent, personne ne voit les trois autres.
2. **Deuxième bifurcation**, plus tard, après la séquence de l'opération et la scène du monstre. Le jeu recalcule sur les axes mis à jour, avec en plus un coup de pouce si la trace persistante montre que ce joueur a déjà vécu certaines fins lors de parties précédentes (`dominantTrait2()`). Cette deuxième vague de quatre chapitres est plus sombre, plus explicitement centrée sur la mort et la disparition.

À la toute fin, `chooseEnding()` combine les quatre axes, le nombre de réponses "inattendues" et l'historique pour choisir parmi **8 fins** distinctes (`endCalme`, `endComplice`, `endLucide`, `endBoucle`, `endMiroir`, `endOubli`, `endVide`, `endDefiance`) — jamais un simple `if/else` binaire comme dans les versions précédentes.

Certaines questions ne sont visibles qu'après avoir déjà obtenu une fin précise lors d'une partie antérieure — de vraies branches débloquées, pas juste une phrase qui change. Ça repose sur une **trace cachée**, séparée de la sauvegarde normale et jamais vidée par le bouton "tout oublier" (deux clés `localStorage` distinctes : `letest_save_v1` et `letest_trace_v1`). Concrètement : le bouton "tout oublier" remet l'écran-titre à zéro comme pour une première visite, mais la trace, elle, garde le compte des resets et la liste des fins déjà vues — et ça peut ressortir, sous forme d'une phrase que le test ne devrait logiquement pas pouvoir connaître.

## Plein écran

Appuyer sur "commencer" tente de passer en plein écran réel (API Fullscreen), ce qui masque la barre système sur les navigateurs qui l'autorisent — Chrome et Firefox sur Android, notamment. Limite honnête côté iPhone : Safari n'autorise pas les pages web à masquer sa propre barre de statut (heure, wifi, batterie) tant que le jeu tourne dans un onglet normal — c'est une restriction volontaire d'Apple, pas un bug d'ici. La seule façon d'obtenir un vrai plein écran sur iPhone est d'installer LE TEST via "Ajouter à l'écran d'accueil" et de le lancer depuis son icône : il s'ouvre alors en mode app, sans barre d'adresse.

Même installé en mode app, une bande noire en bas a mis plusieurs correctifs à être vraiment comprise. D'abord `100dvh` (retiré — reconnu comme valide par la WKWebView standalone même quand sa valeur calculée est fausse, donc il gagnait toujours la cascade CSS). Ensuite un calcul JS de secours (`--vh`, basé sur `window.innerHeight`/`visualViewport.height`, recalculé au chargement, à la rotation et au retour au premier plan) — qui n'a pas suffi non plus. Une capture d'écran envoyée par un testeur a montré que le haut fonctionnait déjà (le fond passe bien sous l'heure/wifi/batterie) mais que le bas restait toujours court : cause la plus probable, `window.innerHeight` et `visualViewport.height` s'arrêtent avant la zone de la barre d'accueil, contrairement à `100vh`/`100dvh` combinés à `viewport-fit=cover` en CSS pur qui, eux, couvrent tout l'écran. Le correctif ajoute explicitement `env(safe-area-inset-bottom)` par-dessus la hauteur calculée en JS. Les boutons et l'icône réglages tiennent aussi compte des zones encoche/barre d'accueil (`env(safe-area-inset-*)`). **Confirmé réglé** par capture d'écran sur iPhone (écran-titre et écran de jeu, plus de bande en bas).

Une variante plus simple a ensuite été tentée (`position:fixed` + `inset:0` seul, sans hauteur explicite du tout, en théorie suffisant et plus robuste) — mais elle a fait réapparaître la bande noire en pratique. Retour à la version ci-dessus, la seule confirmée par capture d'écran réelle. Leçon retenue : ne pas remplacer un correctif validé par une hypothèse plus "élégante" sans nouvelle preuve.

## Structure du repo

```
index.html      → tout le jeu (HTML + CSS + JS, un seul fichier)
manifest.json   → PWA : installable sur téléphone comme une vraie app
sw.js           → service worker, jeu jouable hors-ligne une fois chargé
icons/          → icônes générées (192, 512, apple-touch-icon)
sfx/            → deux sons fournis (pas synthétisés) : rouge et vert
img/            → l'image du monstre, utilisée une seule fois par partie
```

Aucune build step, aucun framework. L'audio est presque entièrement synthétisé (Web Audio API) — trois exceptions, toutes des fichiers fournis, chargés et mixés via Web Audio API comme le reste : `sfx/cryo-outage.mp3` à chaque moment écran rouge, `sfx/cringe-scare.mp3` à chaque moment écran vert, `sfx/heartbeat-flatline.mp3` pendant la séquence noire. Plus aucune synthèse vocale (Web Speech API) dans le jeu — le texte de la séquence noire passe par des sous-titres blancs à l'écran. Les visuels combinent Canvas 2D (ambiance de la pièce, grain, glimpses brefs) et DOM/CSS (le téléviseur et son texte, pour un rendu net et lisible).

## Lancer en local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

Un contexte sécurisé (`localhost` ou HTTPS) est recommandé : les notifications exigent `https://` ou `http://localhost` — un simple double-clic sur `index.html` (`file://`) peut ne pas suffire pour cette permission.

Sur l'écran-titre, un petit bouton "actualiser" force le rechargement de la dernière version : il désinscrit le service worker, vide le cache, puis recharge la page. Pratique pour tester une nouvelle version sans attendre que le cache expire de lui-même.

Pendant la partie, un petit bouton "⏭" discret en haut à droite (à côté des réglages) permet de passer immédiatement à la question suivante — utile pour spammer et arriver vite au moment qu'on veut tester, sans attendre le texte ou les délais.

Sur l'écran-titre, un bouton "version" ouvre une petite fenêtre indiquant le numéro de version (`1.41`, suit le cache `CACHE` de `sw.js`), un rappel que le jeu est en bêta, et un historique déroulant avec un résumé par version (`APP_VERSION` et `VERSION_LOG`, en haut du script — les deux sont à mettre à jour ensemble à chaque déploiement). Les entrées 1.1 à 1.24 sont reconstruites après coup à partir de l'historique de développement ; à partir de 1.25 elles sont exactes.

Sur l'écran-titre, un bouton "partager" ouvre une fenêtre avec deux boutons (iPhone / Android) : chacun copie dans le presse-papiers un message prêt à envoyer, avec le lien du jeu (`https://peur.pages.dev`) et les instructions d'installation adaptées à la plateforme (ajout à l'écran d'accueil via Safari ou Chrome). Constantes `SHARE_URL`, `SHARE_MSG_IOS`, `SHARE_MSG_ANDROID` dans le script.

Il existe aussi un "dossier" caché, jamais indiqué à l'écran : un appui long (900ms) sur le titre "LE TEST" de l'écran d'accueil ouvre une fiche façon document confidentiel, avec un ID de sujet généré, le nom déclaré, un statut clinique calculé à partir du ratio fins calmes / fins anormales, et les stats de session (`renderDossier()` dans le script).

## Publier sur GitHub Pages

1. Pousse ces fichiers à la racine du repo `peur`, branche `main`.
2. Dans **Settings → Pages**, source `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le jeu sera servi sur `https://<ton-pseudo>.github.io/peur/` — HTTPS par défaut, donc les permissions fonctionneront normalement.
4. Sur téléphone, "Ajouter à l'écran d'accueil" installe LE TEST comme une vraie app.

## Vie privée

Rien n'est envoyé à un serveur : pas de backend, pas d'analytics, pas de tracking. Le prénom et le nom saisis restent locaux à l'appareil (`localStorage`), jamais transmis. Les seules autres données stockées sont locales également : nombre de tests passés, dernière visite, détail des fins déjà obtenues, préférences d'affichage. Le profil psychologique (les quatre axes) n'est, lui, jamais sauvegardé — il est recalculé de zéro à chaque partie. Seule la trace des fins déjà vues et du nombre de resets (`letest_trace_v1`) persiste durablement, y compris après "tout oublier".

## Historique

Ce repo a d'abord contenu deux versions précédentes du jeu (mécanique "tenir l'écran" avec caméra obligatoire, puis un gauntlet en cinq épreuves). Cette version est une refonte complète autour d'un concept différent : l'interrogatoire psychologique plutôt que la survie en temps réel. Les fichiers `lib/` et `models/` (détection de visage) des versions précédentes ne sont plus utilisés.
