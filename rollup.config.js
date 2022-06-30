import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import pkg from "./package.json";

export default defineConfig([
  {
    input: "lib/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [esbuild()],
  },
  {
    input: "lib/index.ts",
    output: [
      {
        file: pkg.types,
        format: "es",
      },
    ],
    plugins: [dts()],
  },
]);
