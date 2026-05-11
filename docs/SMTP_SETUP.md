# SMTP 配置指南 — Life OS V1 邮件链路

V0 dev 时不需要配 SMTP, 邮件走 dry-run 模式 (写表 + console log).
**第一个真用户内测前** 必须配通真 SMTP, 否则 Welcome / Sunday Review /
Outcome Due 都不会真发.

下面三条路, 推荐顺序: **Resend → 腾讯企业邮 → 网易企业邮**.

## 通用 env vars

无论用哪家, 都设这五个环境变量 (`.env.local` 本地, Vercel / 部署平台
对应 env vars):

```bash
EMAIL_SMTP_HOST=...                # 服务商 SMTP 服务器
EMAIL_SMTP_PORT=465                # 一般 465 (SSL) 或 587 (STARTTLS)
EMAIL_SMTP_USER=...                # 用户名 (常常就是发件邮箱)
EMAIL_SMTP_PASS=...                # 密码 / SMTP 授权码 / app password
EMAIL_FROM="Life OS <hi@lifeos.cn>"   # 显示给用户的发件人
```

设完重启服务. 调 `GET /api/admin/email-test` 看 `smtpConfigured: true` +
`mode: smtp` 就配通了. 然后 `POST /api/admin/email-test` 真发一封测试信.

---

## Path A: Resend (推荐先用)

**适用**: 国内 + 海外用户都能收到, 不需要企业邮箱, 5 分钟搞定. 免费额度
3000 封/月, 够内测 100 人用半年.

**坑**: 国内某些邮箱 (新浪 / 部分 QQ) 偶尔进垃圾箱, 关键用户走腾讯 / 网易.

### 步骤
1. 注册 https://resend.com (用 GitHub 登录最快)
2. Dashboard → "API Keys" → "Create API Key", 名字"life-os", 复制 `re_xxx`
3. Dashboard → "Domains" → "Add Domain", 填你的域名 (e.g. `lifeos.cn`)
4. Resend 给你 3 条 DNS 记录 (SPF / DKIM / DMARC), 去域名 DNS 商加进去
5. 等 5-15 分钟, Resend Dashboard 显示 "Verified"

### env vars
```bash
EMAIL_SMTP_HOST=smtp.resend.com
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USER=resend             # 固定字符串
EMAIL_SMTP_PASS=re_xxxxxxxx        # 上面复制的 API key
EMAIL_FROM="Life OS <hi@lifeos.cn>"
```

---

## Path B: 腾讯企业邮 (国内首选生产)

**适用**: 全部国内用户. AIGC 备案审核倾向"境内服务商", 选这个加分.

**坑**: 需要企业账号 (营业执照) + 域名验证, 配置 30-60 分钟.

### 步骤
1. 注册 https://exmail.qq.com → 选 "企业版" → 实名认证
2. 添加自己的域名 (e.g. `lifeos.cn`), 按提示加 MX + SPF DNS 记录
3. 创建账号: e.g. `hi@lifeos.cn`, 设密码
4. 个人设置 → 客户端设置 → 开启"SMTP 服务", 生成 SMTP 专用密码 (16 位)

### env vars
```bash
EMAIL_SMTP_HOST=smtp.exmail.qq.com
EMAIL_SMTP_PORT=465                # SSL
EMAIL_SMTP_USER=hi@lifeos.cn
EMAIL_SMTP_PASS=xxxxxxxxxxxxxxxx   # 16 位 SMTP 专用密码 (不是登录密码)
EMAIL_FROM="Life OS <hi@lifeos.cn>"
```

---

## Path C: 网易企业邮 (备用)

跟腾讯几乎一样的体验, 价格略便宜. 路径同 B, host 改:

```bash
EMAIL_SMTP_HOST=smtp.qiye.163.com
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USER=hi@lifeos.cn
EMAIL_SMTP_PASS=...                # 同样需要 SMTP 授权码, 不是登录密码
EMAIL_FROM="Life OS <hi@lifeos.cn>"
```

---

## 强制 dry-run (不真发, 但跟真发一样跑流程)

调试 / 演示环境用:

```bash
EMAIL_DRY_RUN=1
```

设了这个, 即使 SMTP env 都配齐了也只 dry-run.

---

## 验证步骤 (配完后跑一遍)

```bash
# 1. 状态检查
curl -X GET http://localhost:3000/api/admin/email-test \
  -H "X-User-UID: $YOUR_UID"

# 期望: smtpConfigured: true, mode: smtp

# 2. 真发一封 (要先在 /account 页面绑了邮箱)
curl -X POST http://localhost:3000/api/admin/email-test \
  -H "X-User-UID: $YOUR_UID"

# 期望: result.status: 'sent', result.providerMessageId 有值
```

收到信里有发送时间 + 收件人 + 模式 = "SMTP", 链路就通了.

---

## 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| `Invalid login: 535 5.7.8` | 密码错 / 没开 SMTP 服务 | 重新生成 SMTP 授权码 (不是登录密码!) |
| `connect ETIMEDOUT` | 服务器 / 端口错 / 防火墙 | 检查 host + port, 云厂商可能屏蔽 25 端口, 用 465 |
| `mail rejected from sender` | 发件人域名没认证 | 加 SPF / DKIM, 等 DNS 生效 |
| 邮件进垃圾箱 | SPF/DKIM/DMARC 缺一 | 把三条都加全 |
| dry-run 模式不真发 | env 没配齐 / EMAIL_DRY_RUN=1 | 检查 `/api/admin/email-test` GET 返回的 envHints |

---

## AIGC 备案对邮件的要求

- 发件域名建议 **跟主域名一致** (lifeos.cn 用户 + hi@lifeos.cn 发件)
- 邮件底部必须有 "AI 生成内容" 标识 (已自动添加, 见 `lib/safety/disclosure.ts`)
- 退订链接必须有效 (已实现, 模板 footer 含 `unsubscribeUrl`)
- 关键交易类邮件 (Welcome / Outcome Due) **不可** 用任何第三方 SDK 自动发 — 必须是
  本服务器主动调 SMTP, 防止被定为 "未经授权的营销邮件"
