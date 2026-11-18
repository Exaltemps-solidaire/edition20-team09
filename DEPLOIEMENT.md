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

- Passerelle LLM de la plateforme (`llm.internal`, mode `anthropic`, alias `task:cheap`) :
  l'API appelle `POST /v1/chat/completions` avec la clé virtuelle de l'équipe
  (`LLM_API_KEY`, lue depuis l'environnement, publiée dans `secret/core/llm-vkeys` sous le
  champ `team09`). Si elle tombe ou répond en erreur, le dépôt reste fonctionnel : seule la
  fiche proposée est absente de la ressource (dégradé, pas d'échec de la requête).

## Connu comme fragile ou inachevé

- **Stockage en mémoire** : les ressources déposées sont perdues à chaque redémarrage du
  service `api`. Pas de base de données à ce stade.
- Pas encore de publication vers Notion (prévue à l'itération suivante, simulée dans un
  premier temps faute de jeton d'intégration Notion).

## Contact

- Équipe : Équipe 09 (eXaltemps Solidaire).
- Association : ENDOmind, via les cadreurs du hackathon.
