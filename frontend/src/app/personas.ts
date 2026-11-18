// Personas de membres de l'association, pour l'écran "Qui êtes-vous ?" (pas de connexion, pas de compte).
export type Persona = { id: string; nom: string };

export const PERSONAS: Persona[] = [
  { id: "coordinatrice", nom: "Awa, coordinatrice régionale" },
  { id: "communication", nom: "Léa, chargée de communication" },
];
