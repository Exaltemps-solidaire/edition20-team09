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
- **Bilan** : _à remplir en fin d'itération._

## Itération 2 (⚠️ sous réserve de temps) : Chaque ressource déposée reçoit une proposition de fiche organisée par l'IA

- **Dans le périmètre** : appel à la passerelle LLM (`llm.internal`, mode `anthropic`, texte seul) sur le contenu déposé, affichage d'une proposition de fiche (titre, catégorie, résumé court) à côté de la ressource, bouton "Publier vers Notion" qui affiche un statut simulé (mock, pas d'appel réseau réel).
- **Hors périmètre** : vraie écriture Notion, extraction de contenu depuis une URL/PDF, historique des versions d'une fiche.
- **Critères d'acceptation** :
  - Étant donné une ressource déposée sous forme de texte exploitable, quand l'IA l'analyse, alors une proposition de fiche (titre, catégorie, résumé) s'affiche à côté de la ressource.
  - Étant donné une ressource sans contenu exploitable (ex. un lien seul, sans texte collé), quand l'IA l'analyse, alors elle l'indique explicitement plutôt que d'inventer une fiche.
  - Étant donné une fiche proposée, quand on clique "Publier vers Notion", alors un statut "publication simulée" s'affiche, sans appel réseau vers Notion.
- **Hypothèse de l'équipe couverte** : aucune — à faire confirmer par les cadreurs, comme pour l'itération 1.
- **Codage estimé** : 10 minutes
- **Fichiers prévus** : `api/src/routes.ts` (déclenchement de l'analyse), `api/src/llm.ts` (appel passerelle + prompt), `api/src/notion-mock.ts` (client simulé), `frontend/src/app/depot/page.tsx` (affichage fiche + bouton publier).
- **Tests unitaires prévus** : 1 à 3, sur la logique pure de détection "contenu exploitable / pas exploitable" et le formatage de la proposition (sans appeler le vrai LLM).
- **Étapes ajoutées à la démo** : déposer un texte, voir la fiche proposée, cliquer "Publier vers Notion", voir le statut simulé.
- **Bilan** : _à remplir en fin d'itération._

## À venir (liste ordonnée, détaillée au fil de l'eau)

1. Vraie écriture dans Notion, si un jeton d'intégration est fourni par l'équipe.
2. Extraction réelle de contenu depuis une URL ou un document joint (scraping / parsing).
3. Stabilisation finale pour le pitch, si le temps restant ne permet plus qu'une itération.
