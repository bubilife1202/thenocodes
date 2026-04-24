import assert from "node:assert/strict";
import test from "node:test";
import { buildReleaseSignal, releaseSlug, releaseSummary, releaseTitle } from "./sync-agent-releases";

test("releaseSlug preserves version separators as hyphens", () => {
  assert.equal(releaseSlug("hermes-agent", "v2026.4.23"), "hermes-agent-release-v2026-4-23");
});

test("releaseTitle does not duplicate project label", () => {
  assert.equal(
    releaseTitle(
      { project: "hermes-agent", repo: "NousResearch/hermes-agent", label: "Hermes Agent", sourceName: "Hermes Agent GitHub Releases" },
      { tag_name: "v2026.4.23", name: "Hermes Agent v0.11.0 (2026.4.23)", html_url: "https://example.com", body: "", draft: false, prerelease: false, published_at: "2026-04-23T00:00:00Z" }
    ),
    "Hermes Agent v0.11.0 (2026.4.23) 릴리스"
  );
});

test("releaseSummary strips common markdown noise", () => {
  assert.equal(
    releaseSummary({ tag_name: "v1", name: "v1", html_url: "https://example.com", body: "## Changes\n- Add `browser` tool", draft: false, prerelease: false, published_at: "2026-04-23T00:00:00Z" }),
    "Changes Add browser tool"
  );
});

test("buildReleaseSignal tags Hermes rows for the combined OpenClaw/Hermes board", () => {
  const signal = buildReleaseSignal(
    { project: "hermes-agent", repo: "NousResearch/hermes-agent", label: "Hermes Agent", sourceName: "Hermes Agent GitHub Releases" },
    { tag_name: "v2026.4.23", name: "Hermes Agent v0.11.0", html_url: "https://github.com/NousResearch/hermes-agent/releases/tag/v2026.4.23", body: "", draft: false, prerelease: false, published_at: "2026-04-23T00:00:00Z" }
  );

  assert.equal(signal.slug, "hermes-agent-release-v2026-4-23");
  assert.ok(signal.tags.includes("hermes-agent"));
  assert.ok(signal.tags.includes("hermes-agent-official"));
  assert.ok(!signal.tags.includes("openclaw"));
});
