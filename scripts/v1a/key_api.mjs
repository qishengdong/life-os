/**
 * V1A · KEY API caller · 真 hit 本地 Next.js
 *
 * persona 写的话 → 通过 /api/pulse + /api/pulse/[id]/reply + /api/decision/brief
 * 真进 KEY, 跟真用户走一样的路径.
 */

const KEY_BASE = process.env.KEY_BASE || 'http://localhost:3001';

export class KeyClient {
  constructor({ userUid, invited = true }) {
    this.userUid = userUid;
    this.invited = invited;
    this.cookie = invited ? 'key_invited=1' : '';
  }

  async fetch(path, opts = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-UID': this.userUid,
    };
    if (this.cookie) headers['cookie'] = this.cookie;
    const res = await fetch(`${KEY_BASE}${path}`, {
      ...opts,
      headers: { ...headers, ...(opts.headers || {}) },
    });
    return res;
  }

  // 拉今天该问的 question + 历史
  async getPulseSession() {
    const r = await this.fetch('/api/pulse?history=1');
    return r.json();
  }

  // 写一条今日一句
  async submitPulse({ questionId, content }) {
    const r = await this.fetch('/api/pulse', {
      method: 'POST',
      body: JSON.stringify({ questionId, content }),
    });
    return r.json();
  }

  // 续聊
  async replyToPulse({ pulseId, content }) {
    const r = await this.fetch(`/api/pulse/${pulseId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return r.json();
  }

  // 写决定
  async submitDecision({ birthDate, gender, decision, skipEditor = true }) {
    const r = await this.fetch('/api/decision/brief', {
      method: 'POST',
      body: JSON.stringify({ birthDate, gender, decision, skipEditor }),
    });
    return r.json();
  }

  async getBrain() {
    const r = await this.fetch('/api/brain');
    return r.json();
  }

  async getHistory() {
    const r = await this.fetch('/api/history');
    return r.json();
  }
}

// ============================================================================
// Bootstrap · admin login + create invite + redeem · 把 test user 跑通
// ============================================================================

export async function bootstrapTestUser(personaUid) {
  // Admin login (拿 admin_session cookie · 创建 invite)
  const loginRes = await fetch(`${KEY_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'xiao', password: 'key-2026-life' }),
  });
  const adminCookies = loginRes.headers.get('set-cookie');
  if (!adminCookies) throw new Error('admin login fail · 跑 node scripts/seed-admin.mjs 先');
  const adminCookie = adminCookies.split(';')[0];

  // 创建 invite
  const inviteRes = await fetch(`${KEY_BASE}/api/admin/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({
      recipientName: `v1a-sim-${personaUid.slice(0, 8)}`,
      invitedBy: 'v1a-simulation',
      note: 'V1A · 自动模拟',
    }),
  });
  const inviteData = await inviteRes.json();
  const inviteCode = inviteData.invite?.code;
  if (!inviteCode) throw new Error('create invite fail: ' + JSON.stringify(inviteData));

  // 兑换
  const redeemRes = await fetch(`${KEY_BASE}/api/invites/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-UID': personaUid,
    },
    body: JSON.stringify({ code: inviteCode }),
  });
  const redeemData = await redeemRes.json();
  if (!redeemData.recoveryCode) throw new Error('redeem fail: ' + JSON.stringify(redeemData));

  return { inviteCode, recoveryCode: redeemData.recoveryCode };
}
