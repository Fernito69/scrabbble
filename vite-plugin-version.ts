import { Plugin } from "vite";
import { writeFileSync } from "fs";
import { resolve } from "path";

export function versionGeneratorPlugin(): Plugin {
  return {
    name: "version-generator",
    closeBundle() {
      const version = {
        buildTime: Date.now(),
        version: new Date().toISOString(),
      };

      const outDir = resolve(__dirname, "dist");
      writeFileSync(
        resolve(outDir, "version.json"),
        JSON.stringify(version, null, 2)
      );

      console.log("Generated version.json:", version);
    },
  };
}
