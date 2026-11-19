import { cp, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { compileString } from "sass";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = join(root, "dist");
await mkdir(out, { recursive: true });
await cp(join(root, "public"), out, { recursive: true });
await cp(join(root, "template.html"), join(out, "index.html"));

const sassHelpers = `
  @use "sass:math";
  @function px-to-vw($value, $width: 375) { @return math.div($value, $width) * 100vw; }
  @function px-to-rem($value, $size: 16) { @return math.div($value, $size) * 1rem; }
`;

await build({
  entryPoints: [join(root, "src/index.tsx")],
  outfile: join(out, "app.js"),
  bundle: true,
  target: ["safari16.4", "chrome105"],
  jsx: "automatic",
  minify: true,
  platform: "browser",
  loader: { ".review.css": "text" },
  legalComments: "external",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [{
    name: "sass-modules",
    setup(context) {
      context.onLoad({ filter: /\.scss$/ }, async ({ path }) => {
        const source = await readFile(path, "utf8");
        const compiled = compileString(sassHelpers + source, {
          url: pathToFileURL(path),
          quietDeps: true,
          silenceDeprecations: ["import"],
        });
        return { contents: compiled.css, loader: "local-css", resolveDir: dirname(path) };
      });
    },
  }],
});
