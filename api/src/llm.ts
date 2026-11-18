// Analyse d'une ressource déposée par la passerelle LLM de la plateforme (llm.internal,
// mode anthropic, alias task:cheap — contenu court, JSON structuré). Pas d'extraction réelle
// depuis une URL : seul le texte collé est envoyé au modèle.

export type Fiche = { titre: string; categorie: string; resume: string };
export type AnalyseFiche = Fiche | { nonExploitable: true };

// Un contenu réduit à une seule URL (rien d'autre) n'est pas exploitable : on ne télécharge
// jamais la page, donc l'IA n'aurait que l'URL elle-même à analyser.
export function estContenuExploitable(contenu: string): boolean {
  const texte = contenu.trim();
  if (texte === "") return false;
  const estUneSeuleUrl = /^\S+$/.test(texte) && /^https?:\/\//i.test(texte);
  return !estUneSeuleUrl;
}

// Le modèle entoure parfois sa réponse de balises markdown (```json ... ```) malgré la
// consigne : on extrait le premier bloc JSON plutôt que de dépendre d'une sortie brute.
export function extraireJson(texte: string): string {
  return texte.match(/\{[\s\S]*\}/)?.[0] ?? texte;
}

const LLM_BASE_URL = process.env.LLM_BASE_URL ?? "http://llm.internal:9080/v1";
const LLM_API_KEY = process.env.LLM_API_KEY ?? "";

export async function proposerFiche(contenu: string): Promise<AnalyseFiche> {
  if (!estContenuExploitable(contenu)) {
    return { nonExploitable: true };
  }
  const reponse = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "task:cheap",
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "Tu organises des ressources pour une association. Réponds uniquement en JSON " +
            '{"titre":"...","categorie":"...","resume":"..."} (résumé en une phrase courte).',
        },
        { role: "user", content: contenu },
      ],
    }),
  });
  if (!reponse.ok) {
    throw new Error(`passerelle LLM : statut ${reponse.status}`);
  }
  const donnees = (await reponse.json()) as {
    choices: { message: { content: string } }[];
  };
  const texte = donnees.choices[0]?.message.content ?? "{}";
  return JSON.parse(extraireJson(texte)) as Fiche;
}
