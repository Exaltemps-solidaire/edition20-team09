"use client";

import { useRouter } from "next/navigation";
import { PERSONAS } from "./personas";

export default function QuiEtesVous() {
  const router = useRouter();

  function choisir(id: string) {
    sessionStorage.setItem("persona", id);
    router.push("/depot");
  }

  return (
    <main className="conteneur conteneur-etroit">
      <h1>Qui êtes-vous ?</h1>
      <p className="sous-titre">Choisissez le rôle que vous incarnez pour déposer une ressource.</p>
      <ul className="liste-personas">
        {PERSONAS.map((persona) => (
          <li key={persona.id}>
            <button className="bouton-persona" onClick={() => choisir(persona.id)}>{persona.nom}</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
