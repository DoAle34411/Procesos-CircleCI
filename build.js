import { build } from "esbuild";
import { mkdirSync } from "fs";

mkdirSync("dist", { recursive: true });

(async () => {
  await build({
    entryPoints: ["src/index.js"],
    bundle: true,
    platform: "node", // or "browser"
    target: "es2020",
    outfile: "dist/bundle.js",
    minify: true,
    sourcemap: true
  });

  console.log("✅ Build complete! Bundle created at dist/bundle.js");
})();
