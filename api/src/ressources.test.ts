import { describe, expect, it } from "vitest";
import { deposerRessource, listerRessources } from "./ressources.ts";

describe("deposerRessource", () => {
  it("refuse un dépôt sans contenu", () => {
    const resultat = deposerRessource("Awa", "   ");
    expect(resultat).toHaveProperty("erreur");
  });

  it("refuse un dépôt sans déposant", () => {
    const resultat = deposerRessource("", "https://exemple.org/guide");
    expect(resultat).toHaveProperty("erreur");
  });

  it("accepte un dépôt valide et le place en tête de liste", () => {
    const resultat = deposerRessource("Léa", "https://exemple.org/droits-diagnostic");
    expect(resultat).not.toHaveProperty("erreur");
    expect(listerRessources()[0]).toMatchObject({
      deposant: "Léa",
      contenu: "https://exemple.org/droits-diagnostic",
    });
  });
});
