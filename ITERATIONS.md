# Plan d'itérations — ENDOmind

## Changement de direction (remplace le plan précédent)

Le développeur a demandé un virage complet, confirmé comme validé par les cadreurs :

- **Le chatbot pour les bénévoles sur stand sort entièrement du périmètre de notre application.** Il sera remplacé, côté bénévole, par un connecteur ChatGPT ↔ Notion utilisé directement depuis le téléphone — rien à coder ici pour ça.
- **Ce qu'on construit à la place** : une interface pour que les membres de l'association déposent des ressources hétérogènes (liens, documents, texte), qu'une IA analyse pour proposer une fiche organisée (titre, catégorie, résumé) destinée à être reprise dans Notion.
- **Contrainte posée par le développeur** : solution économe en ressources — on réutilise la passerelle LLM déjà provisionnée par la plateforme (`llm.internal`, mode `anthropic`, quota d'équipe), pas de nouvelle clé Mistral.

❗️ **Ce virage inverse une exclusion explicite du cadrage** : `passation/cadrage/7-prd.md` § Hors périmètre qualifiait la gouvernance documentaire de « prérequis humain et organisationnel, pas une fonctionnalité à développer cet après-midi ». Le développeur confirme que les cadreurs ont validé ce changement — je le note ici pour que ce soit tracé, et parce que `passation/cadrage/5-hypotheses.md` reste vide : **aucune hypothèse écrite ne couvre ce nouveau produit**. Les critères d'acceptation ci-dessous sont donc proposés par l'agent, pas tirés d'une hypothèse de l'équipe — à faire confirmer par les cadreurs au prochain tour de test.

- **Source du plan** : proposé par l'agent.
- **Temps restant annoncé** : 45 minutes, déclaré par le développeur au moment de ce re-planning.
- **Durée d'un tour de test PM Lab** : 10 minutes (inchangé depuis la planification précédente).
- **Plan validé le 2026-11-18**, par le développeur, au début de `/iteration 1` (temps restant redéclaré : 30-45 minutes).
- **Capacité** : (10 min codage + 5 min publication + 10 min test) ≈ 25 min par itération. Avec 45 minutes, **une seule itération complète tient confortablement** (≈ 25 min, 20 min de marge). Une 2e itération est détaillée ci-dessous par anticipation, mais ✂️ **elle ne tient pas dans la marge standard** (45 − 25 = 20 min < 25 min nécessaires) : elle suppose soit un codage plus court que prévu en itération 1, soit un tour de test compressé. À réévaluer avec le temps réel restant après l'itération 1 — ne pas se lancer dedans sans redemander le temps restant.

## Hors périmètre

- Le chatbot bénévole de bout en bout, le message de limite, la source affichée — remplacés par le connecteur ChatGPT-Notion externe, hors de notre dépôt.
- L'extraction réelle de contenu depuis une URL ou un PDF (scraping, parsing) : hors budget. L'IA analyse le texte tel que collé par la personne qui dépose, pas un document joint réellement téléchargé.
- L'écriture réelle dans Notion : **simulée (mock)**, décision du développeur — aucun jeton d'intégration Notion n'est provisionné sur cette machine. Le bouton "Publier vers Notion" affiche un statut simulé, sans appel réseau réel.
- Connexion/comptes (inchangé depuis le cadrage initial) : écran "Qui êtes-vous ?" à choisir dans une liste.
- Embeddings / recherche vectorielle : pas de clé OpenAI sur cette machine (`task:embed` → 401). L'IA reçoit le texte déposé directement dans le prompt, pas de RAG.

## Itération 1 : Un membre de l'association peut déposer une ressource et la retrouver dans une liste

- **Dans le périmètre** : squelette publié (`.env.example`, `DEPLOIEMENT.md` selon le contrat de déployabilité — toujours pas produits), écran "Qui êtes-vous ?" avec des personas de membres de l'association (ex. coordinatrice régionale, chargée de communication), écran "Déposer une ressource" avec un champ libre (lien ou texte) et qui l'a déposé, liste des ressources déposées.
- **Hors périmètre** : analyse IA, proposition de fiche, publication vers Notion (tout en itération 2).
- **Critères d'acceptation** :
  - Étant donné l'écran "Qui êtes-vous ?", quand on choisit un persona membre de l'association, alors on arrive sur l'écran "Déposer une ressource".
  - Étant donné un lien ou un texte saisi, quand on valide le dépôt, alors il apparaît dans la liste des ressources déposées avec le nom de la personne qui l'a déposé.
  - Étant donné l'application déployée, quand on appelle `/health` et `/sante` (port 8080) et une route `/api/v1/...` (port 8081 via le proxy), alors les deux répondent 200 avec un corps vérifiable.
- **Hypothèse de l'équipe couverte** : aucune — nouvelle direction, pas encore d'hypothèse écrite par les cadreurs (`5-hypotheses.md` toujours vide). À faire confirmer.
- **Codage estimé** : 10 minutes
- **Fichiers prévus** : `.env.example`, `DEPLOIEMENT.md`, `frontend/src/app/page.tsx` (écran "Qui êtes-vous ?", personas adaptés), `frontend/src/app/depot/page.tsx` (écran dépôt + liste), `api/src/routes.ts` (routes `POST`/`GET /api/v1/ressources`), `api/src/ressources.ts` (stockage en mémoire, pas de base de données à ce stade).
- **Tests unitaires prévus** : 1 à 3, sur la validation d'un dépôt (ex. rejet d'un dépôt vide, format minimal attendu).
- **Étapes ajoutées à la démo** : ouvrir l'app, choisir un persona membre de l'association, déposer un lien, le voir apparaître dans la liste.
- **Bilan** :
  - **Durée de codage réelle** : 3 minutes (budget 10 min, aucun dépassement).
  - **Critères satisfaits** : les 3 critères d'acceptation sont remplis — persona → écran dépôt, dépôt visible dans la liste avec le nom du déposant, `/health`/`/sante` (8080) et `/api/v1/ressources` (8081) répondent 200.
  - **Reporté** : rien de cette itération ; l'analyse IA et la publication Notion restent en itération 2, comme prévu.
  - **Incident hors codage, résolu avant la clôture** : le déploiement a été bloqué ~20 minutes par un rate-limit anonyme Docker Hub sur la VM partagée (`toomanyrequests` sur `registry:2`, `pgvector/pgvector:pg17`, `seaweedfs`), qui empêchait `registry.internal` et `postgres.internal` de démarrer. L'infra a posé un mirroir (`mirror.gcr.io`, fichier `/etc/containers/registries.conf.d/20-miroir-dockerhub.conf`, hors Ansible) ; une fois en place, le pipeline de démarrage de la plateforme est repassé entièrement au vert (`pipeline finished`, toutes étapes `PASS`) sans aucune autre intervention. Le harnais n'a rien bloqué côté code — ni `npm test`, ni `verifier-deployabilite.sh` (aucune borne).
  - **Déploiement** : base `team09` créée, images `team09/api:dev` et `team09/frontend:dev` construites et poussées sur `localhost:5000`, `podman compose up -d --force-recreate` effectué. Vérifié localement : `localhost:8080/`, `/health`, `/sante` → 200 ; `localhost:8081/health`, `/sante`, `/api/v1/ressources` → 200.
  - **Signal** : version 1 enregistrée auprès de PM Lab (`./scripts/signaler-version.sh 1`), à l'URL `https://edition20-team09.exaltemps-space.com`.
  - **Modifications** :
    - `.env.example` — liste `PORT=8081`, seule variable lue actuellement (contrat de déployabilité, règle 2).
    - `DEPLOIEMENT.md` — doc d'une page : services, ports, absence de dépendance externe pour l'instant.
    - `api/src/ressources.ts` — stockage en mémoire et validation d'un dépôt (rejette contenu/déposant vides) ; sert le critère 2.
    - `api/src/ressources.test.ts` — 3 tests Vitest sur la validation du dépôt ; sert le point 2 de la DoD.
    - `api/src/routes.ts` — routes `GET`/`POST /api/v1/ressources` ; sert les critères 2 et 3.
    - `api/src/server.ts` — lecture du corps JSON pour les `POST` ; sert le critère 2.
    - `frontend/src/app/personas.ts` — liste des personas membres de l'association ; sert le critère 1.
    - `frontend/src/app/page.tsx` — écran "Qui êtes-vous ?", navigation vers `/depot` ; sert le critère 1.
    - `frontend/src/app/depot/page.tsx` — écran de dépôt + liste des ressources déposées ; sert le critère 2.
    - `frontend/nginx.conf` — en-têtes de sécurité adaptés du gabarit plateforme, routage multi-pages préservé (pas de fallback SPA) ; sert le point 3 de la DoD.
    - `api/Dockerfile`, `frontend/Dockerfile` — images de base qualifiées `docker.io/library/...` ; sert le point 4 de la DoD.
    - `podman-compose.yml` — services `frontend` (8080) et `api` (8081) sur `core-network` ; sert le point 4 de la DoD.
    - `e2e/demo.spec.ts` — étapes "Je choisis mon rôle" et "Je dépose une ressource" ajoutées à la démo.

## Itération 2 — Plan validé le 2026-11-18 (réduit, ✂️ voir note) : Chaque ressource déposée reçoit une proposition de fiche organisée par l'IA

- ✂️ **Temps restant déclaré au début de cette itération : 15 minutes** — insuffisant pour la capacité standard (≈25 min : 10 codage + 5 publication + 10 tour de test). Décision du développeur : version minimale, publier et signaler **sans attendre un tour de test complet de l'équipe**. Le bouton "Publier vers Notion" et son test dédié sont retirés du périmètre de cette itération pour tenir le budget ; ils repassent en "À venir".
- **Dans le périmètre** : appel à la passerelle LLM (`llm.internal`, mode `anthropic`, texte seul) sur le contenu déposé, affichage d'une proposition de fiche (titre, catégorie, résumé court) à côté de la ressource.
- **Hors périmètre (reporté)** : bouton "Publier vers Notion" (même simulé), vraie écriture Notion, extraction de contenu depuis une URL/PDF, historique des versions d'une fiche.
- **Critères d'acceptation** :
  - Étant donné une ressource déposée sous forme de texte exploitable, quand l'IA l'analyse, alors une proposition de fiche (titre, catégorie, résumé) s'affiche à côté de la ressource.
  - Étant donné une ressource sans contenu exploitable (ex. un lien seul, sans texte collé), quand l'IA l'analyse, alors elle l'indique explicitement plutôt que d'inventer une fiche.
- **Hypothèse de l'équipe couverte** : aucune — à faire confirmer par les cadreurs, comme pour l'itération 1.
- **Codage estimé** : 8 minutes (réduit du fait du temps restant)
- **Fichiers prévus** : `api/src/routes.ts` (déclenchement de l'analyse), `api/src/llm.ts` (appel passerelle + prompt + détection contenu exploitable), `frontend/src/app/depot/page.tsx` (affichage fiche).
- **Tests unitaires prévus** : 1 à 3, sur la logique pure de détection "contenu exploitable / pas exploitable" (sans appeler le vrai LLM).
- **Étapes ajoutées à la démo** : déposer un texte, voir la fiche proposée (si le temps le permet).
- **Bilan** :
  - **Temps restant déclaré en début d'itération** : 15 minutes.
  - **Durée de codage réelle** : 2 minutes (budget réduit 8 min, aucun dépassement).
  - **Critères satisfaits** : les 2 critères d'acceptation retenus — fiche (titre/catégorie/résumé) affichée pour un texte exploitable, message explicite pour un lien seul sans texte collé. Vérifiés en local par appel direct à l'API après déploiement.
  - **Reporté** : le bouton "Publier vers Notion" (même mock) et son test, retirés du périmètre dès la DoR faute de temps ; voir "À venir" #1.
  - **Décision développeur sur le temps** : vu la contrainte de 15 minutes, scope réduit à la version minimale (sans bouton Notion) et publication/signal **sans tour de test PM Lab préalable** — le tour de test se fera après coup, sur la version déjà en ligne.
  - **Ce que le harnais a bloqué ou refusé** : rien — `npm test` passe (8 tests), `verifier-deployabilite.sh` ne signale aucune borne ni alarme.
  - **Point technique rencontré et corrigé pendant l'itération** : la clé virtuelle de la passerelle LLM (`secret/core/llm-vkeys`, champ `team09`) n'existait pas encore — générée et publiée via OpenBao, puis `apisix/seed-and-deploy.sh` rejoué pour créer le consumer APISIX côté `llm.internal`. Le modèle (`task:cheap`) entourait parfois sa réponse de balises markdown (```` ```json ... ``` ````) malgré la consigne de ne répondre qu'en JSON : corrigé par une extraction du premier bloc `{...}` (`extraireJson`), testée unitairement.
  - **Modifications** :
    - `api/src/llm.ts` — appel à `llm.internal` (alias `task:cheap`), détection pure "contenu exploitable" (`estContenuExploitable`), extraction JSON tolérante au markdown (`extraireJson`) ; sert les 2 critères.
    - `api/src/llm.test.ts` — 3 tests Vitest sur `estContenuExploitable` et `extraireJson`, sans appeler le vrai LLM ; sert le point 2 de la DoD.
    - `api/src/ressources.ts` — champ `fiche` sur `Ressource`, fonction `attacherFiche` ; sert l'affichage à côté de la ressource.
    - `api/src/routes.ts` — après un dépôt, appelle `proposerFiche` et attache le résultat ; dégradé silencieux (avec `console.error`) si la passerelle LLM échoue, pour ne jamais faire échouer le dépôt ; `router` devient asynchrone.
    - `api/src/server.ts`, `api/src/routes.test.ts` — adaptés à un `router` asynchrone (`await`).
    - `frontend/src/app/depot/page.tsx` — affichage de la fiche proposée (titre/catégorie/résumé) ou du message "non exploitable" à côté de chaque ressource.
    - `.env.example` — ajout de `LLM_API_KEY` (documentée, sans valeur) ; `.env` local (gitignoré) porte la vraie clé virtuelle.
    - `podman-compose.yml` — `LLM_BASE_URL` et `LLM_API_KEY` (`${LLM_API_KEY}`) injectées au service `api`.
    - `DEPLOIEMENT.md` — section "Services externes" mise à jour (passerelle LLM, mode dégradé).
    - `e2e/demo.spec.ts` — étape "L'IA propose une fiche" ajoutée (non rejouée faute de temps ; hors DoD, ne bloque rien).

## Itération 3 — Plan validé le 2026-11-18 (demande du développeur, temps quasi nul) : L'IA lit vraiment la page d'un lien déposé et l'interface est moins brute

- ❗️ Lève l'exclusion posée en itération 1/2 (« extraction réelle depuis une URL : hors budget »), déjà anticipée comme `#3` de "À venir" ; demande explicite du développeur cette fois.
- ❗️ **Garde-fou de sécurité ajouté d'office, pas en option** : un fetch serveur déclenché par un contenu fourni par un visiteur est un vecteur SSRF classique (le membre dépose `http://postgres.internal` ou `http://openbao.internal:8200` comme "lien", et l'API ferait la requête pour lui depuis le réseau interne). Une URL est donc vérifiée (schéma `http(s)`, hôte ni `*.internal`/`*.local`/`localhost`, ni IP privée/loopback) avant tout fetch, et les redirections ne sont pas suivies (`redirect: "manual"`) pour ne pas contourner le filtre après coup.
- ✂️ **Temps déclaré par le développeur : quasiment nul** ("plus le temps"). Publication et signal faits immédiatement après vérification locale, **sans tour de test PM Lab préalable** — comme en itération 2.
- **Dans le périmètre** : si le contenu déposé est réduit à une seule URL publique, l'API la récupère (texte HTML→brut, 5 s de timeout, 4000 caractères max, pas de nouvelle dépendance), l'envoie au LLM, et la fiche affichée cite la source ; sinon message explicite (URL interne refusée, page inaccessible, etc.) ; les deux écrans existants ont une mise en page de base (CSS plat, pas de nouvelle dépendance).
- **Hors périmètre** : suivi des redirections, extraction de PDF/documents joints, protection SSRF par résolution DNS réelle (seul le nom d'hôte littéral est filtré — une attaque par DNS rebinding n'est pas couverte, risque accepté faute de temps).
- **Critères d'acceptation** :
  - Une ressource composée seulement d'une URL publique → l'IA récupère la page, et la fiche affichée cite l'URL source.
  - Une URL interne/privée ou un schéma non http(s) → refus explicite, aucune requête sortante faite.
  - Les écrans "Qui êtes-vous ?" et "Déposer une ressource" ont une mise en page de base (espacement, couleurs, typo) au lieu du HTML non stylé.
- **Hypothèse de l'équipe couverte** : aucune — demande directe du développeur, à faire confirmer par les cadreurs comme les précédentes.
- **Codage estimé** : réduit au minimum vu le temps quasi nul
- **Fichiers touchés** : `api/src/llm.ts`, `api/src/llm.test.ts`, `frontend/src/app/depot/page.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/globals.css`.
- **Tests unitaires** : 3, sur `extraireUrlUnique`, `estUrlAutorisee` (le garde-fou SSRF) et `extraireTexte`, sans appeler le vrai LLM ni le vrai réseau.
- **Bilan** :
  - **Durée de codage réelle** : 2 minutes, aucun dépassement.
  - **Critères satisfaits** : les 3 — vérifiés en local par appel direct à l'API (`https://example.com` → fiche avec `source`; `http://postgres.internal:5432` → `{"nonExploitable":true,"raison":"adresse interne ou privée refusée"}`) et par inspection visuelle du HTML servi.
  - **Reporté** : rien de nouveau — le bouton "Publier vers Notion" (déjà reporté en itération 2) reste en tête de la liste "À venir".
  - **Décision développeur sur le temps** : publication et signal immédiats, sans tour de test PM Lab préalable (temps déclaré quasi nul).
  - **Ce que le harnais a bloqué ou refusé** : rien — `npm test` passe (9 tests), `verifier-deployabilite.sh` ne signale aucune borne ni alarme.
  - **Modifications** :
    - `api/src/llm.ts` — `extraireUrlUnique`, `estUrlAutorisee` (garde-fou SSRF), `extraireTexte` (HTML→texte sans dépendance), `recupererContenuUrl` (fetch avec timeout 5 s, pas de suivi de redirection, 4000 caractères max) ; `proposerFiche` route vers le fetch quand le contenu est une URL seule et ajoute `source` à la fiche ; sert les critères 1 et 2.
    - `api/src/llm.test.ts` — remplace les tests de l'ancienne `estContenuExploitable` par 3 tests sur `extraireUrlUnique`, `estUrlAutorisee`, `extraireTexte` ; sert le point 2 de la DoD.
    - `frontend/src/app/depot/page.tsx` — affiche la source (lien) de la fiche, le motif de refus explicite, classes CSS pour la mise en page ; sert les critères 1, 2 et 3.
    - `frontend/src/app/page.tsx` — classes CSS pour l'écran "Qui êtes-vous ?" ; sert le critère 3.
    - `frontend/src/app/globals.css` — styles de base (cartes, boutons, espacement) réutilisés par les deux écrans, pas de nouvelle dépendance ; sert le critère 3.
  - **Démo** : `e2e/demo.spec.ts` non mis à jour cette fois, faute de temps — à faire à la prochaine itération si elle en a.

## À venir (liste ordonnée, détaillée au fil de l'eau)

1. Bouton "Publier vers Notion" (mock, statut simulé) — reporté de l'itération 2 faute de temps.
2. Vraie écriture dans Notion, si un jeton d'intégration est fourni par l'équipe.
3. Stabilisation finale pour le pitch, si le temps restant ne permet plus qu'une itération (mettre à jour `e2e/demo.spec.ts` avec les étapes "lien analysé" et "refus explicite" si le temps le permet).
