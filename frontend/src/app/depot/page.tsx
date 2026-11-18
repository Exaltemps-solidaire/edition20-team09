"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PERSONAS } from "../personas";

type Ressource = { id: string; deposant: string; contenu: string; deposeLe: string };

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
    <main>
      <header>
        <span>Connecté en tant que {persona.nom}</span>
        <button onClick={changerPersona}>Changer de rôle</button>
      </header>
      <h1>Déposer une ressource</h1>
      <form onSubmit={deposer}>
        <textarea
          value={contenu}
          onChange={(evenement) => setContenu(evenement.target.value)}
          placeholder="Collez un lien ou un texte à organiser"
        />
        <button type="submit">Déposer</button>
      </form>
      {erreur && <p role="alert">{erreur}</p>}
      <h2>Ressources déposées</h2>
      <ul>
        {ressources.map((ressource) => (
          <li key={ressource.id}>
            <strong>{ressource.deposant}</strong> — {ressource.contenu}
          </li>
        ))}
      </ul>
    </main>
  );
}
