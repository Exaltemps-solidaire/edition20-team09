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
    <main>
      <h1>Qui êtes-vous ?</h1>
      <p>Choisissez le rôle que vous incarnez pour déposer une ressource.</p>
      <ul>
        {PERSONAS.map((persona) => (
          <li key={persona.id}>
            <button onClick={() => choisir(persona.id)}>{persona.nom}</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
