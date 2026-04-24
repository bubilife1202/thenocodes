import assert from "node:assert/strict";
import { test } from "node:test";
import { isSafeInfographicImageUrl } from "./url";

test("isSafeInfographicImageUrl accepts https image URLs", () => {
  assert.equal(isSafeInfographicImageUrl("https://cdn.example.com/cards/agent.png"), true);
  assert.equal(isSafeInfographicImageUrl("https://cdn.example.com/cards/agent.webp?width=1200"), true);
});

test("isSafeInfographicImageUrl rejects non-https URLs", () => {
  assert.equal(isSafeInfographicImageUrl("http://cdn.example.com/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("javascript:alert(1)"), false);
});

test("isSafeInfographicImageUrl rejects local or private hosts", () => {
  assert.equal(isSafeInfographicImageUrl("https://localhost/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("https://127.0.0.1/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("https://10.0.0.5/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("https://192.168.0.7/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("https://[::1]/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("https://[::ffff:127.0.0.1]/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("https://[fc00::1]/cards/agent.png"), false);
  assert.equal(isSafeInfographicImageUrl("https://[fe80::1]/cards/agent.png"), false);
});

test("isSafeInfographicImageUrl rejects non-image or svg paths", () => {
  assert.equal(isSafeInfographicImageUrl("https://cdn.example.com/cards/agent"), false);
  assert.equal(isSafeInfographicImageUrl("https://cdn.example.com/cards/agent.html"), false);
  assert.equal(isSafeInfographicImageUrl("https://cdn.example.com/cards/agent.svg"), false);
});
