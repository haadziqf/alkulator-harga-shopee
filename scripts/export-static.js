import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function buildStatic() {
  console.log("Prerendering static HTML for GitHub Pages...");
  
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    }
  );

  let html = await response.text();

  // Get base path for GitHub Pages (e.g. /alkulator-harga-shopee/)
  const repoName = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
    : "/alkulator-harga-shopee/";

  console.log(`Using base path: ${repoName}`);

  // Replace all asset references with absolute repository base path
  html = html.replaceAll('./assets/', `${repoName}assets/`);
  html = html.replaceAll('/assets/', `${repoName}assets/`);
  html = html.replaceAll('/workspace/sites/kalkulator-harga-shopee/.vinext/', `${repoName}.vinext/`);
  html = html.replaceAll('./.vinext/', `${repoName}.vinext/`);
  html = html.replaceAll('./manifest.json', `${repoName}manifest.json`);
  html = html.replaceAll('./favicon.svg', `${repoName}favicon.svg`);
  html = html.replaceAll('./sw.js', `${repoName}sw.js`);
  html = html.replaceAll('./Template_Pembukuan_Toko_Marketplace_2026.xlsx', `${repoName}Template_Pembukuan_Toko_Marketplace_2026.xlsx`);

  const staticDir = path.join(rootDir, "dist", "static");
  const clientDir = path.join(rootDir, "dist", "client");
  const publicDir = path.join(rootDir, "public");
  const fontsDir = path.join(rootDir, ".vinext");

  // Remove existing static dir if any
  if (fs.existsSync(staticDir)) {
    fs.rmSync(staticDir, { recursive: true, force: true });
  }

  // Copy client assets to static dir
  fs.cpSync(clientDir, staticDir, { recursive: true });

  // Copy public files (manifest.json, sw.js, etc.)
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, staticDir, { recursive: true });
  }

  // Copy .vinext fonts to static dir if exists
  if (fs.existsSync(fontsDir)) {
    fs.cpSync(fontsDir, path.join(staticDir, ".vinext"), { recursive: true });
  }

  // Write index.html to static dir
  fs.writeFileSync(path.join(staticDir, "index.html"), html, "utf-8");

  // Create .nojekyll to prevent GitHub Pages from ignoring files starting with _
  fs.writeFileSync(path.join(staticDir, ".nojekyll"), "", "utf-8");

  console.log("✅ Static export ready at dist/static/!");
}

buildStatic().catch((err) => {
  console.error("Static export failed:", err);
  process.exit(1);
});
