import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { copyStarterToDirectory, createScenarioZip, SCENARIO_SLUG, STARTER_FILES } from "./package-scenario";

function run(command: string, args: string[], cwd: string) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

function readZipEntries(zipFile: string): string[] {
  const buffer = readFileSync(zipFile);
  const entries: string[] = [];
  let offset = 0;
  while (offset < buffer.length - 4) {
    const signature = buffer.readUInt32LE(offset);
    if (signature === 0x02014b50) {
      const nameLength = buffer.readUInt16LE(offset + 28);
      const extraLength = buffer.readUInt16LE(offset + 30);
      const commentLength = buffer.readUInt16LE(offset + 32);
      entries.push(buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8"));
      offset += 46 + nameLength + extraLength + commentLength;
      continue;
    }
    offset += 1;
  }
  return entries;
}

function fail(message: string): never {
  console.error(`FAIL scenario package verification: ${message}`);
  process.exit(1);
}

const repoRoot = process.cwd();
const archive = createScenarioZip({ repoRoot }).outFile;
const archiveStat = statSync(archive);
if (!archiveStat.isFile() || archiveStat.size < 1024) {
  fail(`archive missing or too small: ${archive}`);
}

const zipEntries = readZipEntries(archive).sort();
const expectedEntries = [...STARTER_FILES].sort();
if (JSON.stringify(zipEntries) !== JSON.stringify(expectedEntries)) {
  fail(`zip entries mismatch\nexpected=${JSON.stringify(expectedEntries)}\nactual=${JSON.stringify(zipEntries)}`);
}
if (zipEntries.some((entry) => entry.includes("SOLUTIONS") || entry.includes("node_modules") || entry.includes(".DS_Store"))) {
  fail(`zip includes forbidden entry: ${JSON.stringify(zipEntries)}`);
}

const tempRoot = mkdtempSync(join(tmpdir(), `${SCENARIO_SLUG}-verify-`));
const starterRoot = join(tempRoot, SCENARIO_SLUG);
copyStarterToDirectory(starterRoot, repoRoot);

for (const file of STARTER_FILES) {
  if (!existsSync(join(starterRoot, file))) {
    fail(`starter temp copy missing ${file}`);
  }
}
if (existsSync(join(starterRoot, "SOLUTIONS.md"))) {
  fail("SOLUTIONS.md leaked into starter temp copy");
}

const install = run("npm", ["ci", "--ignore-scripts"], starterRoot);
if (install.status !== 0) {
  fail(`npm ci failed\n${install.stdout}\n${install.stderr}`);
}

const test = run("npm", ["test"], starterRoot);
const testOutput = `${test.stdout}\n${test.stderr}`;
if (test.status === 0) {
  fail(`starter tests unexpectedly passed; seed scenario should fail exactly one test before learner fix\n${testOutput}`);
}
if (!/1 failed/.test(testOutput) || !/2 passed/.test(testOutput)) {
  fail(`starter tests did not fail exactly 1/3 as expected\n${testOutput}`);
}

rmSync(tempRoot, { recursive: true, force: true });
console.log(`PASS scenario package verification: ${archive} (${archiveStat.size} bytes), entries=${zipEntries.length}, seed tests fail exactly 1/3`);
