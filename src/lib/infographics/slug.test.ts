import assert from "node:assert/strict";
import { test } from "node:test";
import { createInfographicSlug } from "./slug";

test("createInfographicSlug keeps Korean text and normalizes spaces", () => {
  assert.equal(createInfographicSlug("  논문 요약: Agent Memory 2026  "), "논문-요약-agent-memory-2026");
});

test("createInfographicSlug removes punctuation and collapses hyphens", () => {
  assert.equal(createInfographicSlug("GitHub - OpenAI/awesome-ai!!!"), "github-openaiawesome-ai");
});

test("createInfographicSlug returns an empty string when no letters or numbers remain", () => {
  assert.equal(createInfographicSlug("!!! ---"), "");
});
