// Service api du gabarit : écoute sur PORT (8081 par défaut), journaux sur la sortie standard.
// Lancé directement par Node (suppression des types TypeScript), sans étape de compilation.
import { createServer, type IncomingMessage } from "node:http";
import { router } from "./routes.ts";

const port = Number(process.env.PORT ?? 8081);

function lireCorpsJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let donnees = "";
    req.on("data", (morceau) => (donnees += morceau));
    req.on("end", () => {
      if (!donnees) return resolve(undefined);
      try {
        resolve(JSON.parse(donnees));
      } catch {
        resolve(undefined);
      }
    });
  });
}

const serveur = createServer(async (req, res) => {
  const corpsRequete = req.method === "POST" ? await lireCorpsJson(req) : undefined;
  const { statut, corps } = router(req.method ?? "GET", req.url ?? "/", corpsRequete);
  if (corps === undefined) {
    res.writeHead(statut).end();
  } else {
    res.writeHead(statut, { "Content-Type": "application/json" }).end(JSON.stringify(corps));
  }
});

serveur.listen(port, () => console.log(`api : à l'écoute sur le port ${port}`));

// Arrêt propre : le conteneur reçoit SIGTERM, on termine les requêtes en cours avant de sortir.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    console.log(`api : ${signal} reçu, arrêt`);
    serveur.close(() => process.exit(0));
  });
}
