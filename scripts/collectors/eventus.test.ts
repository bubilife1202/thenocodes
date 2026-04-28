import { strict as assert } from "node:assert";
import test from "node:test";
import { classifyEventUsCategory } from "./eventus.js";

test("classifyEventUsCategory maps seminars and meetups to meetup category", () => {
  assert.equal(
    classifyEventUsCategory({ title: "생성형 AI 세미나", description: "실전 자동화 사례", tags: [], fallbackCategory: "hackathon" }),
    "meetup"
  );

  assert.equal(
    classifyEventUsCategory({ title: "AI Builder Meetup", description: "Seoul", tags: [], fallbackCategory: "contest" }),
    "meetup"
  );
});

test("classifyEventUsCategory keeps contests and hackathons distinct", () => {
  assert.equal(
    classifyEventUsCategory({ title: "AI 서비스 공모전", description: "", tags: [], fallbackCategory: "meetup" }),
    "contest"
  );

  assert.equal(
    classifyEventUsCategory({ title: "노코드 해커톤", description: "", tags: [], fallbackCategory: "contest" }),
    "hackathon"
  );
});
