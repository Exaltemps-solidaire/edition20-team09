// Stockage en mémoire des ressources déposées par les membres de l'association.
// Pas de base de données à ce stade (itération 1) : les données ne survivent pas à un
// redémarrage du service — limite connue, documentée dans DEPLOIEMENT.md.

import type { AnalyseFiche } from "./llm.ts";

export type Ressource = {
  id: string;
  deposant: string;
  contenu: string;
  deposeLe: string;
  fiche?: AnalyseFiche;
};

export type DepotInvalide = { erreur: string };

const ressources: Ressource[] = [];

export function deposerRessource(deposant: unknown, contenu: unknown): Ressource | DepotInvalide {
  if (typeof deposant !== "string" || deposant.trim() === "") {
    return { erreur: "le nom du déposant est requis" };
  }
  if (typeof contenu !== "string" || contenu.trim() === "") {
    return { erreur: "le contenu (lien ou texte) est requis" };
  }
  const ressource: Ressource = {
    id: crypto.randomUUID(),
    deposant: deposant.trim(),
    contenu: contenu.trim(),
    deposeLe: new Date().toISOString(),
  };
  ressources.push(ressource);
  return ressource;
}

export function listerRessources(): Ressource[] {
  return [...ressources].reverse();
}

export function attacherFiche(id: string, fiche: AnalyseFiche): void {
  const ressource = ressources.find((r) => r.id === id);
  if (ressource) ressource.fiche = fiche;
}
