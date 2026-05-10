# Life OS 部署指南 (V0 → V1)

**目标读者**: 你 (非技术创始人 + Claude 操作员)
**前置条件**: V0 本地能跑, 决定要让真用户用了

---

## 部署架构选择 (按你"少依赖云"哲学排序)

### 选项 A: VPS 自托管 (推荐, 最贴合你哲学) ⭐
- **成本**: ¥80-300/月 (4GB RAM 入门)
- **服务商**: 腾讯云轻量 / 阿里云 ECS / Hetzner (海外)
- **优点**: 数据完全你的, 无 vendor lock-in, 月费可控
- **难度**: 中 (需配 Docker + Nginx + 备案)

### 选项 B: Vercel 自动部署
- **成本**: 免费额度 → ¥150/月起
- **优点**: 0 运维, 自动 HTTPS, 全球 CDN
- **缺点**: 跟你"少依赖云"哲学冲突 + 数据在 Vercel + 中国访问慢
- **适用**: 出海版可选, 国内主版不推荐

### 选项 C: 国内 PaaS (阿里云函数计算 / 腾讯云 Serverless)
- **成本**: 几乎免费 (按调用)
- **难度**: 高 (改造 SQLite 为 RDS, 改造无状态)
- **不推荐 V0**

**我的强推**: 选项 A. 下面只讲选项 A 路径.

---

## V0 → V1 部署 6 步

### Step 1: 买 VPS + 域名

**VPS**:
- 国内主版: 腾讯云轻量 (北京/上海) 4 核 4G 60GB SSD ≈ ¥120/月
- 出海版 (海外华人): Hetzner CX22 (法兰克福/赫尔辛基) ≈ ¥40/月

**域名**:
- 国内: 阿里云万网 .cn 或 .com (¥60-100/年)
- 出海: Cloudflare Registrar (.com ≈ $10/年, 不加价)

### Step 2: ICP 备案 (国内主版必做, 2-4 周)

**前提**:
- 国内主体 (个体户 / 公司)
- 企业证件 / 法人身份证

**流程** (你做, 不让 Claude 替):
1. 阿里云/腾讯云 → 备案中心 → 新增备案
2. 填:
   - 主办者信息 (公司或个人)
   - 域名: lifeos.cn (或类似)
   - 接入服务商: 你的 VPS 服务商
   - 网站名称: "决策伴侣 — 个人决策辅助"
   - 网站类型: **信息咨询** (绝对不要写"心理咨询"或"算命")
   - 内容描述: "为高知中产提供基于决策科学的人生决策辅助分析,
                 不替代专业医疗 / 法律 / 财务咨询"
3. 提交 → 通信管理局审核 (15-20 工作日)
4. 备案号下来后, 部署到 VPS, 网站 footer 必须显示备案号

**重要**: 这个备案过程中**不能上线**, 否则被发现会被注销.

### Step 3: 部署 Docker

```bash
# 1. SSH 到 VPS
ssh root@your-vps-ip

# 2. 装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# 3. 拉代码 (从 GitHub clone)
cd /opt
git clone https://github.com/qishengdong/life-os.git
cd life-os

# 4. 配 .env
cp .env.example .env
vim .env
# 填入 DEEPSEEK_API_KEY 等

# 5. Build + run
docker compose up -d --build

# 6. 验证
curl http://localhost:3000/api/health
# 应返回 {"ok":true,...}
```

### Step 4: 配 Nginx + HTTPS (Let's Encrypt)

```bash
# 装 Caddy (比 Nginx 简单, 自动 HTTPS)
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | tee /etc/apt/trusted.gpg.d/caddy-stable.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy

# 配 Caddyfile
cat > /etc/caddy/Caddyfile <<'EOF'
your-domain.com {
    reverse_proxy localhost:3000
    encode gzip

    # 备案 footer 注入 (V1 后置)
    header X-Frame-Options DENY
    header X-Content-Type-Options nosniff
    header Referrer-Policy strict-origin-when-cross-origin
    header X-XSS-Protection "1; mode=block"
}
EOF

systemctl reload caddy
# Caddy 会自动跑 Let's Encrypt, 5 分钟后 https 可访问
```

### Step 5: 商户号申请 (收款必需)

**国内路径**:
- **类目选择**: "知识付费" 或 "文化娱乐 - 信息咨询" (绝对不要"心理咨询")
- **流程**:
  1. 微信 → 商户平台 → 注册商户号
  2. 提交营业执照 (个体户也行)
  3. 提交"经营内容截图" (网站首页 + 类目说明 + 隐私政策页)
  4. 通过率: 知识付费类目 70-80%, 心理咨询类目 < 30%
- **替代**: 如果微信被拒, 用 Stripe (出海) + 支付宝商户号 (国内备选)

**关键合规**:
- 网站必须有「服务说明」「隐私政策」「用户协议」3 个页面
- 这 3 个页面**审核时必须可访问**

### Step 6: 上线前 checklist

- [ ] /api/health 返回 200
- [ ] HTTPS 证书有效 (绿锁)
- [ ] 备案号显示在 footer
- [ ] 隐私协议 / 用户协议 / 服务说明 3 个页面已发布
- [ ] 商户号支付测试通过 (¥1 试单)
- [ ] DEEPSEEK_API_KEY 充值充足 (≥ ¥500)
- [ ] 数据备份 cron 已设 (`/data/life-os.db` 每天打包传 R2)
- [ ] 监控 (Uptime Kuma 或类似免费工具)
- [ ] 错误告警 (Sentry 免费 5K events/月)
- [ ] Real Grader cron 启用 (Day 9+ 后)

---

## 数据备份策略

V0 SQLite 单文件, 备份极简:

```bash
# /etc/cron.daily/lifeos-backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /opt/life-os/data/life-os.db /var/backups/lifeos/lifeos-${DATE}.db
# 保留 30 天
find /var/backups/lifeos -name "lifeos-*.db" -mtime +30 -delete

# Optional: 同步到 R2 (Cloudflare 免费 10G)
# rclone copy /var/backups/lifeos r2:lifeos-backup
```

V1+ 用户多了切 Postgres 时, 这个备份策略要重做.

---

## 监控建议

| 工具 | 监控什么 | 成本 |
|---|---|---|
| Uptime Kuma | /api/health 是否 200 | 免费 (自托管) |
| Caddy 日志 | 5xx error rate | 免费 |
| DeepSeek 控制台 | API 用量 / 余额 | 免费 |
| 自建 dashboard | grader_runs 历史 / decisions 计数 | 免费 |

---

## 隐私 / 合规底线

我们承诺给用户的:
1. **数据本地化**: 用户数据存在 VPS (中国境内), 不出境
2. **不卖数据**: 永远不卖给第三方
3. **可导出**: 用户可一键导出全部 memory + decisions (V1.5)
4. **可删除**: 用户可一键删除账号 (V1.5)
5. **不分析**: 不做用户画像广告投放
6. **API 调用**: 我们调 DeepSeek API 时只发用户当前对话, 不带 user_uid
7. **加密**: brain.md / decisions 在数据库里加密存储 (V2)

这些放进《隐私政策》, 法务先看, 但**不要瞎承诺加密 V2 才有**. V0 诚实写 "数据明文存储在我们 VPS 上, 仅授权工程师可访问".
