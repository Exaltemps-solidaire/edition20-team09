// Routage de l'API, sans dépendance : une fonction pure, testable sans démarrer de serveur.
// Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe : les routes métier
// se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine (port 8081).
import { attacherFiche, deposerRessource, listerRessources } from "./ressources.ts";
import { proposerFiche } from "./llm.ts";

export type Reponse = { statut: number; corps?: unknown };

export async function router(methode: string, url: string, corps?: unknown): Promise<Reponse> {
  const chemin = new URL(url, "http://api").pathname;
  if (methode === "GET" && (chemin === "/health" || chemin === "/sante")) {
    return { statut: 200, corps: { status: "ok" } };
  }
  if (chemin === "/api/v1/ressources" && methode === "GET") {
    return { statut: 200, corps: listerRessources() };
  }
  if (chemin === "/api/v1/ressources" && methode === "POST") {
    const { deposant, contenu } = (corps ?? {}) as { deposant?: unknown; contenu?: unknown };
    const resultat = deposerRessource(deposant, contenu);
    if ("erreur" in resultat) return { statut: 400, corps: resultat };
    // L'analyse IA ne doit pas empêcher le dépôt : une panne de la passerelle LLM
    // laisse la ressource sans fiche plutôt que de faire échouer la requête.
    try {
      const fiche = await proposerFiche(resultat.contenu);
      attacherFiche(resultat.id, fiche);
      resultat.fiche = fiche;
    } catch (erreur) {
      // Dégradé : pas de fiche, la ressource reste consultable sans elle.
      console.error("analyse IA indisponible :", erreur);
    }
    return { statut: 201, corps: resultat };
  }
  return { statut: 404 };
}
