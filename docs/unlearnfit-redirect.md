# unlearnfit.kr → thenocodes.org/scenarios 301 리다이렉트

**상태:** 사용자 수행 (user-executed step, not automated). Ralph가 DNS/Cloudflare 설정을 만지지 않는다.

**목적:** UnlearnFit 브랜드 회수 + 기존 백링크 보존. `unlearnfit.kr/*` → `https://thenocodes.org/scenarios` 로 전체 301.

**플랜 참조:** `.omc/plans/thenocodes-integration-v2-ai-real-problem.md` §10 ("inherited unchanged: `unlearnfit.kr` 301 redirect mechanism (target URL revised below)"). 타겟 경로는 Rev4의 `/simulator`에서 Rev5의 `/scenarios`로 갱신.

---

## 옵션 A (권장) — Cloudflare DNS + Bulk Redirect

1. Cloudflare 대시보드에서 `unlearnfit.kr` 영역 선택.
2. **Rules → Redirect Rules → Create rule**.
3. 조건: `Hostname equals unlearnfit.kr OR Hostname equals www.unlearnfit.kr`.
4. 액션: `Dynamic → concat("https://thenocodes.org/scenarios")` (경로 보존이 필요 없다면) 또는 `concat("https://thenocodes.org/scenarios", http.request.uri.path)` (경로 보존).
5. 상태 코드: **301 Permanent Redirect**.
6. Preserve query string: ON.
7. 저장 후 `curl -I https://unlearnfit.kr/` 로 검증. 응답이 `HTTP/2 301`, `location: https://thenocodes.org/scenarios` 가 되어야 한다.

**왜 권장:** 코드 변경 없음, Cloudflare 플래시 적용, 추가 Worker 배포 불필요.

---

## 옵션 B (선택) — Cloudflare Worker 라우트

`unlearnfit.kr/*` 를 thenocodes 워커로 라우팅한 뒤 워커 내부에서 리다이렉트.

`wrangler.toml` (or compat) 에 라우트 추가:

```toml
[[routes]]
pattern = "unlearnfit.kr/*"
zone_name = "unlearnfit.kr"
```

워커 로직(OpenNext 래퍼 전단):

```ts
// 워커 entry — OpenNext 기본 핸들러 앞단에 삽입
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.hostname === "unlearnfit.kr" || url.hostname === "www.unlearnfit.kr") {
      const target = new URL("https://thenocodes.org/scenarios");
      target.search = url.search;
      return Response.redirect(target.toString(), 301);
    }
    return defaultHandler(request, env, ctx);
  },
};
```

**왜 보조안:** DNS 변경 없이 코드로 제어. 다만 Cloudflare Workers 배포 주기에 리다이렉트가 묶인다. 단순 301은 옵션 A가 더 깔끔하다.

---

## 검증 체크리스트 (리다이렉트 적용 후)

- [ ] `curl -sI https://unlearnfit.kr/` → `HTTP/2 301` + `location: https://thenocodes.org/scenarios`.
- [ ] `curl -sI https://unlearnfit.kr/anything` → (경로 보존 설정 시) `location: https://thenocodes.org/scenarios/anything` 또는 (미보존 시) `https://thenocodes.org/scenarios`.
- [ ] 브라우저에서 `unlearnfit.kr` 진입 → `thenocodes.org/scenarios` 로 이동.
- [ ] Google Search Console 에 두 도메인 모두 등록되어 있는지 확인. 없다면 `thenocodes.org` 기준으로 속성 등록.

## 보관 기간

현재 Open Question (Plan §9): `unlearnfit.kr` 12개월 보유 후 만료 vs 무기한 유지 — 사용자 결정 필요. 리다이렉트 자체는 도메인 만료 전까지 유지.
