// Routage de l'API, sans dépendance : une fonction pure, testable sans démarrer de serveur.
// Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe : les routes métier
// se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine (port 8081).
import { deposerRessource, listerRessources } from "./ressources.ts";

export type Reponse = { statut: number; corps?: unknown };

export function router(methode: string, url: string, corps?: unknown): Reponse {
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
    return "erreur" in resultat ? { statut: 400, corps: resultat } : { statut: 201, corps: resultat };
  }
  return { statut: 404 };
}
