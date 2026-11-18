# Déploiement

Application pour l'association **ENDOmind**. Elle permet aux membres de l'association de
déposer des ressources hétérogènes (liens, textes) en vue de leur organisation ; une itération
suivante y ajoutera une proposition de fiche générée par IA, à reprendre dans Notion.

## Services

- `frontend/` (exposé publiquement, port 8080 sur le serveur) : Next.js en export statique,
  servi par nginx. Écran "Qui êtes-vous ?" puis écran de dépôt.
- `api/` (port 8081, appelé via `/api/...`) : Node sans dépendance, stocke les ressources
  déposées et répond `/health` et `/sante`.

## Services externes

Aucun pour cette itération. Une itération suivante appellera la passerelle LLM de la
plateforme (`LLM_BASE_URL` / `LLM_API_KEY`) pour analyser les ressources déposées ; si elle
tombe, le dépôt de ressources restera fonctionnel, seule l'analyse IA sera indisponible.

## Connu comme fragile ou inachevé

- **Stockage en mémoire** : les ressources déposées sont perdues à chaque redémarrage du
  service `api`. Pas de base de données à ce stade.
- Pas encore d'analyse IA ni de publication vers Notion (prévues à l'itération suivante,
  simulée dans un premier temps faute de jeton d'intégration Notion).

## Contact

- Équipe : Équipe 09 (eXaltemps Solidaire).
- Association : ENDOmind, via les cadreurs du hackathon.
