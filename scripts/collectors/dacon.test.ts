import { strict as assert } from "node:assert";
import test from "node:test";
import { extractDaconCompetitionCards, extractDaconDateFields, extractDaconPrize } from "./dacon.js";

test("extractDaconCompetitionCards reads current official competition card markup", () => {
  const html = `
    <div class="comp">
      <a href="/competitions/official/236696/overview/" class="clearfix">
        <div class="pic"><img src="https://dacon.s3.ap-northeast-2.amazonaws.com/competition/236696/logo_cpt.jpeg" alt="스마트 창고 출고 지연 예측 AI 경진대회"></div>
        <div class="desc">
          <p class="name ellipsis">스마트 창고 출고 지연 예측 AI 경진대회</p>
          <p class="info2 ellipsis keyword"><span>알고리즘 | 정형 | 회귀 | 스마트물류 | MAE</span></p>
        </div>
        <div class="etc"><div class="dday"><img src="/img/participating.jpg" alt="participating"> 참가신청중 </div></div>
      </a>
    </div>`;

  const cards = extractDaconCompetitionCards(html);

  assert.equal(cards.length, 1);
  assert.equal(cards[0].id, "236696");
  assert.equal(cards[0].title, "스마트 창고 출고 지연 예측 AI 경진대회");
  assert.equal(cards[0].keyword, "알고리즘 | 정형 | 회귀 | 스마트물류 | MAE");
  assert.equal(cards[0].statusText, "참가신청중");
});

test("extractDaconDateFields prefers period_end as the public competition deadline", () => {
  const html = `competitionDetail:{period_start:"2026-04-01 10:00:00",period_end:"2026-05-04 10:00:00",submission_end:"2026-04-23 23:59:59",prize_info:"데이스쿨 프로 구독권"}`;

  const dates = extractDaconDateFields(html);

  assert.equal(dates.startsAt, "2026-04-01T01:00:00.000Z");
  assert.equal(dates.endsAt, "2026-05-04T01:00:00.000Z");
  assert.equal(extractDaconPrize(html), "데이스쿨 프로 구독권");
});
