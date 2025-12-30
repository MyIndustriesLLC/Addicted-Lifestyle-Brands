import path from "node:path";
import ts from "typescript";

const projectRoot = process.cwd();

const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, "tsconfig.json");
if (!configPath) {
  console.error("Unable to locate tsconfig.json");
  process.exit(1);
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  const message = ts.formatDiagnosticsWithColorAndContext([configFile.error], formatHost());
  console.error(message);
  process.exit(1);
}

const parsed = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath)
);

const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });

const sourceFiles = program
  .getSourceFiles()
  .filter((file) => shouldCheckFile(file.fileName))
  .sort((a, b) => a.fileName.localeCompare(b.fileName));

let hasFailures = false;

for (const file of sourceFiles) {
  const diagnostics = ts.getPreEmitDiagnostics(program, file);
  const relativePath = path.relative(projectRoot, file.fileName) || file.fileName;

  if (diagnostics.length === 0) {
    console.log(`PASS ${relativePath}`);
    continue;
  }

  hasFailures = true;
  console.error(`\nFAIL ${relativePath}`);
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost()));
}

if (hasFailures) {
  console.error(`\nType errors detected in ${projectRoot}`);
  process.exit(1);
}

console.log(`\nChecked ${sourceFiles.length} TypeScript files.`);

function shouldCheckFile(filePath: string) {
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
    return false;
  }

  if (!filePath.startsWith(projectRoot)) {
    return false;
  }

  const normalized = filePath.replace(/\\/g, "/");

  if (normalized.includes("node_modules")) {
    return false;
  }

  if (normalized.endsWith(".d.ts")) {
    return false;
  }

  const baseName = path.basename(normalized);

  if (baseName.includes(".test.")) {
    return false;
  }

  if (baseName.includes(".spec.")) {
    return false;
  }

  return true;
}

function formatHost(): ts.FormatDiagnosticsHost {
  return {
    getCurrentDirectory: () => projectRoot,
    getCanonicalFileName: (fileName) => fileName,
    getNewLine: () => ts.sys.newLine,
  };
}
