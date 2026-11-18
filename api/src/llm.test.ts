import { describe, expect, it } from "vitest";
import { estContenuExploitable, extraireJson } from "./llm.ts";

describe("estContenuExploitable", () => {
  it("rejette un contenu vide ou un lien seul, sans texte autour", () => {
    expect(estContenuExploitable("")).toBe(false);
    expect(estContenuExploitable("   ")).toBe(false);
    expect(estContenuExploitable("https://exemple.org/guide")).toBe(false);
  });

  it("accepte un texte, même contenant un lien", () => {
    expect(estContenuExploitable("Voir https://exemple.org/guide pour le détail")).toBe(true);
    expect(estContenuExploitable("Un résumé des ressources pour les bénévoles")).toBe(true);
  });
});

describe("extraireJson", () => {
  it("extrait le JSON d'une réponse entourée de balises markdown, le laisse inchangé sinon", () => {
    const reponse = '```json\n{"titre":"Guide","categorie":"Stand","resume":"Un résumé."}\n```';
    expect(extraireJson(reponse)).toBe('{"titre":"Guide","categorie":"Stand","resume":"Un résumé."}');
    expect(extraireJson('{"titre":"Guide"}')).toBe('{"titre":"Guide"}');
  });
});
