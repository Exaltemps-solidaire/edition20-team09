import { describe, expect, it } from "vitest";
import { estUrlAutorisee, extraireJson, extraireTexte, extraireUrlUnique } from "./llm.ts";

describe("extraireUrlUnique", () => {
  it("reconnaît un contenu réduit à une seule URL, pas un texte qui en contient une", () => {
    expect(extraireUrlUnique("https://exemple.org/guide")).toBe("https://exemple.org/guide");
    expect(extraireUrlUnique("Voir https://exemple.org/guide pour le détail")).toBeNull();
    expect(extraireUrlUnique("")).toBeNull();
  });
});

describe("estUrlAutorisee", () => {
  it("bloque les adresses internes, privées ou non http(s), autorise une URL publique", () => {
    expect(estUrlAutorisee("http://postgres.internal:5432")).toBe(false);
    expect(estUrlAutorisee("http://localhost:9000")).toBe(false);
    expect(estUrlAutorisee("http://192.168.1.10")).toBe(false);
    expect(estUrlAutorisee("file:///etc/passwd")).toBe(false);
    expect(estUrlAutorisee("https://exemple.org/guide")).toBe(true);
  });
});

describe("extraireTexte", () => {
  it("retire scripts, styles et balises pour ne garder que le texte", () => {
    const html = "<html><head><style>.a{}</style></head><body><script>alert(1)</script><h1>Titre</h1><p>Un  texte.</p></body></html>";
    expect(extraireTexte(html)).toBe("Titre Un texte.");
  });
});

describe("extraireJson", () => {
  it("extrait le JSON d'une réponse entourée de balises markdown, le laisse inchangé sinon", () => {
    const reponse = '```json\n{"titre":"Guide","categorie":"Stand","resume":"Un résumé."}\n```';
    expect(extraireJson(reponse)).toBe('{"titre":"Guide","categorie":"Stand","resume":"Un résumé."}');
    expect(extraireJson('{"titre":"Guide"}')).toBe('{"titre":"Guide"}');
  });
});
