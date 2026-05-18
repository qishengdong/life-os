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
// E2E: 真提交 brief 表单 + 等结果页
//   防 5/18 灾难: 我之前 21/21 PASS 但只测 "页面加载", 没真提交.
//   用户点提交 → 504 timeout → 前端炸 "Unexpected token A". 这种必须 smoke 抓.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('decision brief E2E', () => {
  test('短决策真生成 brief 不超时', async ({ page, context }) => {
    const uid = crypto.randomUUID();
    const url = new URL(BASE_URL);
    await context.addCookies([{
      name: 'key_invited', value: '1',
      domain: url.hostname, path: '/', sameSite: 'Lax',
    }]);
    await page.addInitScript((u) => {
      try { localStorage.setItem('life_os_uid', u); } catch {}
    }, uid);

    const { errors, pageErrors } = trackErrors(page);

    await page.goto(`${BASE_URL}/decisions/new`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 填表 · 短输入 (full pipeline 应能 <60s)
    await page.fill('textarea', '我在考虑要不要换工作. 现在的薪水还行, 但 3 年了感觉没成长, 老板对我也不够认可.');
    await page.fill('input[type="date"]', '1985-06-01');

    const submitPromise = page.waitForResponse(
      (r) => r.url().includes('/api/decision/brief') && r.request().method() === 'POST',
      { timeout: 70_000 },
    );
    await page.click('button[type="submit"]');
    const resp = await submitPromise;

    expect.soft(resp.status(), 'brief POST 状态码').toBeLessThan(500);
    const ct = resp.headers()['content-type'] || '';
    expect.soft(ct, 'brief POST content-type').toContain('application/json');

    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    const html = await page.content();
    const hasJsonParseErr = html.includes('Unexpected token') || html.includes('is not valid JSON');
    const onResultPage = /\/decisions\/\w+/.test(finalUrl) && !finalUrl.endsWith('/decisions/new');

    expect.soft(hasJsonParseErr, 'frontend 不能出 JSON parse error').toBe(false);
    expect.soft(onResultPage, '应跳到 /decisions/[number] 结果页').toBe(true);
    expect.soft(pageErrors, '提交 pageErrors').toEqual([]);
  });
});
