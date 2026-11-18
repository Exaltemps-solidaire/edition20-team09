"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PERSONAS } from "../personas";

type Fiche =
  | { titre: string; categorie: string; resume: string; source?: string }
  | { nonExploitable: true; raison?: string };
type Ressource = { id: string; deposant: string; contenu: string; deposeLe: string; fiche?: Fiche };

export default function Depot() {
  const router = useRouter();
  const [personaId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem("persona"),
  );
  const [contenu, setContenu] = useState("");
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) router.replace("/");
  }, [personaId, router]);

  useEffect(() => {
    if (personaId) chargerRessources();
  }, [personaId]);

  async function chargerRessources() {
    const reponse = await fetch("/api/v1/ressources");
    if (reponse.ok) setRessources(await reponse.json());
  }

  const persona = PERSONAS.find((p) => p.id === personaId);

  async function deposer(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    const reponse = await fetch("/api/v1/ressources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deposant: persona?.nom, contenu }),
    });
    if (!reponse.ok) {
      const corps = await reponse.json();
      setErreur(corps.erreur ?? "le dépôt a échoué");
      return;
    }
    setContenu("");
    chargerRessources();
  }

  function changerPersona() {
    sessionStorage.removeItem("persona");
    router.push("/");
  }

  if (!persona) return null;

  return (
    <main className="conteneur">
      <header className="en-tete">
        <span>Connecté en tant que {persona.nom}</span>
        <button className="bouton-discret" onClick={changerPersona}>Changer de rôle</button>
      </header>
      <h1>Déposer une ressource</h1>
      <form className="carte formulaire-depot" onSubmit={deposer}>
        <textarea
          value={contenu}
          onChange={(evenement) => setContenu(evenement.target.value)}
          placeholder="Collez un lien ou un texte à organiser"
        />
        <button className="bouton-principal" type="submit">Déposer</button>
      </form>
      {erreur && <p className="message-erreur" role="alert">{erreur}</p>}
      <h2>Ressources déposées</h2>
      <ul className="liste-ressources">
        {ressources.map((ressource) => (
          <li className="carte" key={ressource.id}>
            <p><strong>{ressource.deposant}</strong> — {ressource.contenu}</p>
            {ressource.fiche && "nonExploitable" in ressource.fiche && (
              <p className="fiche fiche-vide">
                L&apos;IA n&apos;a pas produit de fiche
                {ressource.fiche.raison ? ` (${ressource.fiche.raison})` : " (contenu non exploitable)"}.
              </p>
            )}
            {ressource.fiche && !("nonExploitable" in ressource.fiche) && (
              <div className="fiche">
                <p><strong>{ressource.fiche.titre}</strong> <span className="etiquette">{ressource.fiche.categorie}</span></p>
                <p>{ressource.fiche.resume}</p>
                {ressource.fiche.source && (
                  <p className="source">
                    Source : <a href={ressource.fiche.source} target="_blank" rel="noreferrer">{ressource.fiche.source}</a>
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
