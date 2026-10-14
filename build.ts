import { rm } from "node:fs/promises";
import tailwind from "bun-plugin-tailwind";

await rm("./public", { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: ["./web/index.html"],
  outdir: "./public",
  minify: true,
  plugins: [tailwind],
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log(`Built ${result.outputs.length} files -> public/next`);