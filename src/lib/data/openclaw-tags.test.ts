import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenclawBoardTags, getProjectFromTags, getCategoryFromTags } from "./openclaw-tags";

test("buildOpenclawBoardTags strips reserved routing tags and applies Hermes canonical tags", () => {
  const tags = buildOpenclawBoardTags(["OpenClaw", "openclaw-news", "Hermes", "release"], {
    project: "hermes-agent",
    category: "official",
  });

  assert.deepEqual(tags, ["release", "hermes-agent", "hermes-agent-official"]);
});

test("canonical OpenClaw tag wins over legacy Hermes alias", () => {
  assert.equal(getProjectFromTags(["OpenClaw", "Hermes", "release"]), "openclaw");
});

test("Hermes Agent category is read from canonical category tags", () => {
  assert.equal(getCategoryFromTags(["hermes-agent", "hermes-agent-community"], "hermes-agent"), "community");
});
