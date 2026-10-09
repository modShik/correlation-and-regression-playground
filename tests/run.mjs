import ts from "typescript";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "statlab-tests-"));
try {
  const code = ts.transpileModule(
    fs.readFileSync(path.join(root, "src/lib/statistics.ts"), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
      },
    },
  ).outputText;
  fs.writeFileSync(path.join(temporary, "statistics.mjs"), code);
  fs.writeFileSync(
    path.join(temporary, "statistics.test.mjs"),
    fs
      .readFileSync(path.join(root, "tests/statistics.test.mjs"), "utf8")
      .replace("../src/lib/statistics.ts", "./statistics.mjs"),
  );
  const result = spawnSync(
    process.execPath,
    [path.join(temporary, "statistics.test.mjs")],
    { stdio: "inherit" },
  );
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
