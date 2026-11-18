// Analyse d'une ressource déposée par la passerelle LLM de la plateforme (llm.internal,
// mode anthropic, alias task:cheap — contenu court, JSON structuré). Un contenu réduit à une
// seule URL publique est récupéré côté serveur (texte brut extrait du HTML) avant analyse ;
// la fiche produite cite alors sa source.

export type Fiche = { titre: string; categorie: string; resume: string; source?: string };
export type AnalyseFiche = Fiche | { nonExploitable: true; raison?: string };

// Un contenu réduit à une seule URL (rien d'autre autour) déclenche la récupération de la page.
export function extraireUrlUnique(contenu: string): string | null {
  const texte = contenu.trim();
  if (texte === "") return null;
  if (/^\S+$/.test(texte) && /^https?:\/\//i.test(texte)) return texte;
  return null;
}

// Garde-fou SSRF : l'API ne va chercher une page que sur une adresse publique http(s). Un
// membre malveillant ne doit pas pouvoir faire requêter l'API vers le réseau interne
// (postgres.internal, openbao.internal, localhost, IP privées) en déposant l'URL comme lien.
export function estUrlAutorisee(urlBrute: string): boolean {
  let url: URL;
  try {
    url = new URL(urlBrute);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const hote = url.hostname.toLowerCase();
  if (hote === "localhost" || hote.endsWith(".internal") || hote.endsWith(".local")) return false;
  if (hote === "::1") return false;
  const ipv4 = hote.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10 || a === 127 || a === 0) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 169 && b === 254) return false;
  }
  return true;
}

// Pas de librairie d'analyse HTML (aucune dépendance nouvelle) : on retire scripts/styles/
// balises et on aplatit les espaces, suffisant pour donner du texte exploitable au LLM.
export function extraireTexte(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function recupererContenuUrl(url: string): Promise<string> {
  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), 5000);
  try {
    // Pas de suivi de redirection : une page publique qui redirige vers une adresse interne
    // ne doit pas être récupérée silencieusement — on préfère échouer que de la suivre.
    const reponse = await fetch(url, { signal: controleur.signal, redirect: "manual" });
    if (!reponse.ok) throw new Error(`page : statut ${reponse.status}`);
    const typeContenu = reponse.headers.get("content-type") ?? "";
    if (!typeContenu.includes("text/html") && !typeContenu.includes("text/plain")) {
      throw new Error("type de contenu non pris en charge");
    }
    const html = await reponse.text();
    return extraireTexte(html).slice(0, 4000);
  } finally {
    clearTimeout(minuteur);
  }
}

// Le modèle entoure parfois sa réponse de balises markdown (```json ... ```) malgré la
// consigne : on extrait le premier bloc JSON plutôt que de dépendre d'une sortie brute.
export function extraireJson(texte: string): string {
  return texte.match(/\{[\s\S]*\}/)?.[0] ?? texte;
}

const LLM_BASE_URL = process.env.LLM_BASE_URL ?? "http://llm.internal:9080/v1";
const LLM_API_KEY = process.env.LLM_API_KEY ?? "";

export async function proposerFiche(contenu: string): Promise<AnalyseFiche> {
  const texte = contenu.trim();
  if (texte === "") return { nonExploitable: true };

  let contenuAAnalyser = texte;
  let source: string | undefined;
  const urlSeule = extraireUrlUnique(texte);
  if (urlSeule) {
    if (!estUrlAutorisee(urlSeule)) {
      return { nonExploitable: true, raison: "adresse interne ou privée refusée" };
    }
    try {
      contenuAAnalyser = await recupererContenuUrl(urlSeule);
    } catch {
      return { nonExploitable: true, raison: "impossible de récupérer la page" };
    }
    if (contenuAAnalyser === "") {
      return { nonExploitable: true, raison: "page récupérée mais vide" };
    }
    source = urlSeule;
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
        { role: "user", content: contenuAAnalyser },
      ],
    }),
  });
  if (!reponse.ok) {
    throw new Error(`passerelle LLM : statut ${reponse.status}`);
  }
  const donnees = (await reponse.json()) as {
    choices: { message: { content: string } }[];
  };
  const texteReponse = donnees.choices[0]?.message.content ?? "{}";
  const fiche = JSON.parse(extraireJson(texteReponse)) as Fiche;
  if (source) fiche.source = source;
  return fiche;
}
