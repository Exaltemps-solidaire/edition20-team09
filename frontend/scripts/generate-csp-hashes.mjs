// Calcule les hashes sha256 des scripts inline que Next.js émet dans l'export
// statique (données de flight RSC, mêmes sur un export "statique") et les
// injecte dans nginx.conf à la place de __CSP_SCRIPT_HASHES__. Ces scripts
// sont générés par notre propre build, pas par du contenu utilisateur : un
// hash par contenu exact est plus sûr que 'unsafe-inline' et reste exact
// même si le contenu change à chaque build (le hash est recalculé ici).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const [outDir, confIn, confOut] = process.argv.slice(2);

function listHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listHtmlFiles(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const inlineScript = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g;
const hashes = new Set();

for (const file of listHtmlFiles(outDir)) {
  const html = readFileSync(file, "utf8");
  for (const [, content] of html.matchAll(inlineScript)) {
    if (!content.trim()) continue;
    const hash = createHash("sha256").update(content, "utf8").digest("base64");
    hashes.add(`'sha256-${hash}'`);
  }
}

const conf = readFileSync(confIn, "utf8").replaceAll(
  "__CSP_SCRIPT_HASHES__",
  [...hashes].join(" "),
);
writeFileSync(confOut, conf);
console.log(`[generate-csp-hashes] ${hashes.size} hash(es) injectée(s) dans ${confOut}`);
