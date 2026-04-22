import { mkdirSync, readFileSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type PackageOptions = {
  repoRoot?: string;
  outFile?: string;
};

export const SCENARIO_SLUG = "scenario-01-timezone";
export const DOWNLOAD_PATH = `/downloads/${SCENARIO_SLUG}.zip`;
export const STARTER_FILES = [
  "README.md",
  "SCENARIO.md",
  "PROMPT_LOG_TEMPLATE.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "src/formatMeetupDate.ts",
  "src/formatMeetupDate.test.ts",
] as const;

const FORBIDDEN_PATTERNS = [/^SOLUTIONS\.md$/, /^node_modules\//, /^\.DS_Store$/, /^\.next\//, /^\.turbo\//];

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUInt16(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function writeUInt32(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function zipTimestamp() {
  // Fixed deterministic timestamp: 2026-04-22 00:00:00 local DOS time.
  const dosTime = 0;
  const dosDate = ((2026 - 1980) << 9) | (4 << 5) | 22;
  return { dosTime, dosDate };
}

function assertAllowedFiles(files: readonly string[]) {
  for (const file of files) {
    const normalized = file.replaceAll("\\", "/");
    if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(normalized))) {
      throw new Error(`Forbidden starter package entry: ${file}`);
    }
  }
}

export function createScenarioZip(options: PackageOptions = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
  const scenarioRoot = join(repoRoot, "scenarios", SCENARIO_SLUG);
  const outFile = options.outFile ?? join(repoRoot, "public", "downloads", `${SCENARIO_SLUG}.zip`);
  const { dosTime, dosDate } = zipTimestamp();

  assertAllowedFiles(STARTER_FILES);
  mkdirSync(dirname(outFile), { recursive: true });

  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const relativePath of STARTER_FILES) {
    const name = relativePath.replaceAll("\\", "/");
    const nameBuffer = Buffer.from(name, "utf8");
    const contents = readFileSync(join(scenarioRoot, relativePath));
    const checksum = crc32(contents);

    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(checksum),
      writeUInt32(contents.length),
      writeUInt32(contents.length),
      writeUInt16(nameBuffer.length),
      writeUInt16(0),
      nameBuffer,
    ]);

    const centralHeader = Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(20),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(checksum),
      writeUInt32(contents.length),
      writeUInt32(contents.length),
      writeUInt16(nameBuffer.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(0o100644 << 16),
      writeUInt32(offset),
      nameBuffer,
    ]);

    localParts.push(localHeader, contents);
    centralParts.push(centralHeader);
    offset += localHeader.length + contents.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(STARTER_FILES.length),
    writeUInt16(STARTER_FILES.length),
    writeUInt32(centralDirectory.length),
    writeUInt32(offset),
    writeUInt16(0),
  ]);

  writeFileSync(outFile, Buffer.concat([...localParts, centralDirectory, endRecord]));
  return { outFile, files: [...STARTER_FILES] };
}

export function copyStarterToDirectory(destinationRoot: string, repoRoot = process.cwd()) {
  assertAllowedFiles(STARTER_FILES);
  rmSync(destinationRoot, { recursive: true, force: true });
  mkdirSync(destinationRoot, { recursive: true });

  const scenarioRoot = join(repoRoot, "scenarios", SCENARIO_SLUG);
  for (const relativePath of STARTER_FILES) {
    cpSync(join(scenarioRoot, relativePath), join(destinationRoot, relativePath), { recursive: true });
  }
}

function isDirectRun() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  const result = createScenarioZip();
  console.log(`PASS packaged ${result.files.length} starter files -> ${result.outFile}`);
}
