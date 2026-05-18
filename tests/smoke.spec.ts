/**
 * 真浏览器 smoke test · Playwright headless Chromium
 *
 * 跑完整 user flow + 抓 client-side exceptions:
 *   1. 兑换邀请码 (POST /api/invites/redeem 通过浏览器 form)
 *   2. 依次访问每个 user-protected 路径
 *   3. 每页等 React hydrate, 检 console error / page error / "Application error" text
 *   4. 截图每页存到 test-results/
 *   5. 任何一页有 error → 整个 test fail
 *
 * 这是为了不再发生 5/17 那次"测试全 PASS 但用户首点崩"的事.
 *
 * 跑法:
 *   BASE_URL=https://keypoint.life npx playwright test tests/smoke.spec.ts
 *   或 local: BASE_URL=http://localhost:3000 npx playwright test
 */
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://keypoint.life';
const ADMIN_USER = process.env.ADMIN_USER || 'xiao';
const ADMIN_PASS = process.env.ADMIN_PASS || 'key-2026-life';

// 所有真用户 protected 路径 — middleware matcher 里全部
const PROTECTED_PATHS = [
  '/pulse',
  '/brain',
  '/letters/new',
  '/decisions/new',
  '/history',
  '/outcomes',
  '/review',
  '/unsent',
  '/settings',
  '/your-pattern',  // 5/18 ship
  '/home',          // 5/18 ship · 老用户客厅
];

// public path · 不需要 cookie
const PUBLIC_PATHS = [
  '/',
  '/about',
  '/methodology',
  '/transparency',
  '/sample-brief',
  '/invite',
  '/recover',
  '/pricing',
  '/privacy',
  '/terms',
  '/membership',
];

// 收集 page 上的所有 client error
function trackErrors(page: Page): { errors: string[]; pageErrors: string[] } {
  const errors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // 忽略 4xx network log noise (我们用 expect 单独看 HTTP)
      if (/Failed to load resource.*4\d{2}/.test(text)) return;
      errors.push(text);
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });
  return { errors, pageErrors };
}

async function assertNoClientCrash(page: Page, label: string) {
  // 1. 文本里不能出现 React 崩溃 fallback
  const html = await page.content();
  const crashes = [
    'Application error',
    'a client-side exception has occurred',
    'BAILOUT_TO_CLIENT_SIDE_RENDERING', // 这个其实正常时也有, 但我们不期望它单独显示
  ];
  for (const c of crashes) {
    if (c === 'BAILOUT_TO_CLIENT_SIDE_RENDERING') continue; // skip (info, not error)
    expect.soft(html, `[${label}] HTML 包含 "${c}"`).not.toContain(c);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public pages — 不需要登录 / 邀请
// ─────────────────────────────────────────────────────────────────────────────
test.describe('public pages', () => {
  for (const path of PUBLIC_PATHS) {
    test(`GET ${path} 不崩`, async ({ page }) => {
      const { errors, pageErrors } = trackErrors(page);
      const resp = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      expect.soft(resp?.status(), `${path} HTTP`).toBeLessThan(500);
      await page.waitForTimeout(1500); // wait for hydration
      await assertNoClientCrash(page, path);
      expect.soft(pageErrors, `${path} pageErrors`).toEqual([]);
      // console errors 容许小噪声 (favicon 等), 但不能有 React error / TypeError
      const realErrors = errors.filter((e) =>
        /TypeError|ReferenceError|Cannot read|Promise/i.test(e),
      );
      expect.soft(realErrors, `${path} console errors`).toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Authed flow — 兑换 → 走每个 protected 路径
// ─────────────────────────────────────────────────────────────────────────────
test.describe('authed user flow', () => {
  test.describe.configure({ mode: 'serial' });

  let inviteCode = '';
  let recoveryCode = '';

  test.beforeAll(async ({ request }) => {
    // 1. admin login → 拿 cookie
    const loginResp = await request.post(`${BASE_URL}/api/admin/login`, {
      data: { username: ADMIN_USER, password: ADMIN_PASS },
    });
    expect(loginResp.ok(), 'admin login').toBeTruthy();

    // 2. 创建 test 邀请码
    const adminCookies = loginResp.headers()['set-cookie'];
    const inviteResp = await request.post(`${BASE_URL}/api/admin/invites`, {
      headers: { cookie: adminCookies || '', 'content-type': 'application/json' },
      data: {
        recipientName: `smoke-${Date.now()}`,
        invitedBy: 'playwright-smoke',
        note: '自动化 smoke test',
      },
    });
    const inviteData = await inviteResp.json();
    inviteCode = inviteData.invite?.code;
    expect(inviteCode, 'invite code created').toBeTruthy();
    console.log(`[smoke] 使用邀请码 ${inviteCode}`);
  });

  test('兑换邀请码 → 进 /pulse', async ({ page, context }) => {
    const { errors, pageErrors } = trackErrors(page);

    // 用 fetch 兑换 (UI 流程 复杂 form, 用 API 更稳)
    const uid = crypto.randomUUID();
    const r = await page.request.post(`${BASE_URL}/api/invites/redeem`, {
      headers: { 'X-User-UID': uid, 'content-type': 'application/json' },
      data: { code: inviteCode },
    });
    const body = await r.json();
    recoveryCode = body.recoveryCode;
    expect(recoveryCode, '拿到 recoveryCode').toBeTruthy();

    // 把 cookie + UID 注入浏览器 (模拟用户兑换后的状态)
    const url = new URL(BASE_URL);
    await context.addCookies([
      {
        name: 'key_invited',
        value: '1',
        domain: url.hostname,
        path: '/',
        sameSite: 'Lax',
      },
    ]);
    await page.addInitScript((u) => {
      try { localStorage.setItem('life_os_uid', u); } catch {}
    }, uid);

    // 现在访问 /pulse, 应该 200
    const resp = await page.goto(`${BASE_URL}/pulse`, { waitUntil: 'networkidle', timeout: 30000 });
    expect.soft(resp?.status(), '/pulse 应 200').toBe(200);
    await page.waitForTimeout(2000);
    await assertNoClientCrash(page, '/pulse');
    expect.soft(pageErrors, '/pulse pageErrors').toEqual([]);
    const realErrors = errors.filter((e) =>
      /TypeError|ReferenceError|Cannot read|Promise/i.test(e),
    );
    expect.soft(realErrors, '/pulse console errors').toEqual([]);
  });

  // 每个 protected 路径 1 个 test
  for (const path of PROTECTED_PATHS) {
    test(`authed visit ${path}`, async ({ page, context }) => {
      // 注入 cookie + UID
      const uid = crypto.randomUUID();
      const url = new URL(BASE_URL);
      await context.addCookies([
        {
          name: 'key_invited',
          value: '1',
          domain: url.hostname,
          path: '/',
          sameSite: 'Lax',
        },
      ]);
      await page.addInitScript((u) => {
        try { localStorage.setItem('life_os_uid', u); } catch {}
      }, uid);

      const { errors, pageErrors } = trackErrors(page);
      const resp = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      expect.soft(resp?.status(), `${path} HTTP`).toBeLessThan(500);
      // wait extra long for React hydration + data fetch
      await page.waitForTimeout(3000);

      // 截图存证 (test-results/<path>.png)
      await page.screenshot({
        path: `test-results/smoke-${path.replace(/\//g, '_')}.png`,
        fullPage: true,
      });

      await assertNoClientCrash(page, path);
      expect.soft(pageErrors, `${path} pageErrors`).toEqual([]);
      const realErrors = errors.filter((e) =>
        /TypeError|ReferenceError|Cannot read|Promise/i.test(e),
      );
      expect.soft(realErrors, `${path} console errors`).toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// E2E: 真提交 brief 表单 → 验证前端容错 (核心目标)
//
// 防 5/18 灾难: 之前 21/21 PASS 但只测 "页面加载", 没真提交.
// 用户点提交 → Vercel 504 → 前端 .json() 解析 "An error o..." → "Unexpected token A".
//
// 本 test 目标: 不管 brief 真出来还是失败 (LLM key 没配 / timeout / 服务器错),
// **前端绝不能出 "Unexpected token / is not valid JSON" 这种 JS 解析炸**.
//
// 通过条件 (任一):
//   (A) brief 真生成成功, 跳 /decisions/[number]
//   (B) 失败但出**清晰中文错误** (e.g. "生成超时..."), 不是 JS 解析炸
// 失败条件:
//   - HTML 含 "Unexpected token" / "is not valid JSON"
//   - 页面 React pageError
// ─────────────────────────────────────────────────────────────────────────────
test.describe('decision brief E2E', () => {
  test('submit 真不让前端炸 (无论 LLM 真成功还是失败)', async ({ page, context }) => {
    // brief gen on prod 可能跑 45-60s (Inspector 自审等), 默认 60s test timeout 不够
    test.setTimeout(120_000);
    const uid = crypto.randomUUID();
    const url = new URL(BASE_URL);
    await context.addCookies([{
      name: 'key_invited', value: '1',
      domain: url.hostname, path: '/', sameSite: 'Lax',
    }]);
    await page.addInitScript((u) => {
      try { localStorage.setItem('life_os_uid', u); } catch {}
    }, uid);

    const { pageErrors } = trackErrors(page);

    await page.goto(`${BASE_URL}/decisions/new`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 填表 · 短输入
    await page.fill('textarea', '我在考虑要不要换工作. 现在薪水还行, 但 3 年了没成长.');
    await page.fill('input[type="date"]', '1985-06-01');

    // 提交 · 等 70s (LLM 真跑时最多 ~60s)
    const submitPromise = page.waitForResponse(
      (r) => r.url().includes('/api/decision/brief') && r.request().method() === 'POST',
      { timeout: 70_000 },
    );
    await page.click('button[type="submit"]');
    const resp = await submitPromise;

    // wait for frontend to render the result OR error
    await page.waitForTimeout(2500);

    const html = await page.content();
    const finalUrl = page.url();

    // ★ 核心断言: 不能有 JS parse crash (Hotfix 1 的真验证)
    const hasJsonParseErr = html.includes('Unexpected token') || html.includes('is not valid JSON');
    expect(hasJsonParseErr, 'frontend 出了 JS parse crash (Hotfix 1 失效)').toBe(false);

    // 不能有 React page error
    expect(pageErrors, 'page 出了 React 错').toEqual([]);

    // 通过 (A) 或 (B)
    const onResultPage = /\/decisions\/\w+/.test(finalUrl) && !finalUrl.endsWith('/decisions/new');
    // 检 visible error message · ember/red 文字 or "生成超时" / "失败" / "错误" 字样
    const visibleErrorEl = await page.locator('.text-ember, .text-red-700, .text-red-600').count();
    const errorTextVisible = html.includes('生成超时') || html.includes('生成失败')
      || html.includes('安全短路') || visibleErrorEl > 0;

    const passA = onResultPage; // brief 真出来了
    const passB = !onResultPage && errorTextVisible; // 失败但出清晰错误

    console.log(`[E2E] resp.status=${resp.status()}, ct=${resp.headers()['content-type']}, finalUrl=${finalUrl}, passA=${passA}, passB=${passB}`);

    expect(
      passA || passB,
      'submit 后既没跳 result, 也没出可见 error · 沉默炸',
    ).toBe(true);
  });
});
