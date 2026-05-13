import Link from 'next/link';

export const metadata = {
  title: '隐私政策 — KEY',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
          KEY
        </Link>
        <Link href="/about" className="text-sm text-ink-500 hover:text-seal transition-colors">
          ← 关于
        </Link>
      </nav>

      <main className="max-w-prose-lg mx-auto px-6 pb-20">
        <header className="pt-12 pb-12">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
            · Privacy Policy · v0.1 ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">
            隐私政策
          </h1>
          <p className="font-mono text-xs text-ink-400">
            生效日期 TBD (上线前确定) · 上线前请律师 review
          </p>
        </header>

        <article className="prose prose-editorial max-w-none font-serif editorial-leading">

          <h2>1. 我们是谁</h2>
          <p>
            KEY 是一个 AI 决策辅助工具, 帮助你想透重大人生决策.
          </p>
          <p>
            <strong>运营主体</strong>: TBD<br />
            <strong>联系方式</strong>: TBD
          </p>

          <h2>2. 我们收集什么</h2>

          <h3>2.1 你主动提供的</h3>
          <ul>
            <li>生日 / 性别 (建档时填写)</li>
            <li>决策描述 (你提交的每个决策的内容)</li>
            <li>Daily Pulse 答案 (每天的人生信号)</li>
            <li>Onboarding 访谈答案 (价值观 / 人格 / 人生事件)</li>
          </ul>

          <h3>2.2 系统自动生成的</h3>
          <ul>
            <li>用户唯一标识 (UUID, 浏览器 localStorage)</li>
            <li>AI 从你对话里抽取的 fact (RMC 卡)</li>
            <li>AI 写给自己的 brain 备忘录</li>
            <li>决策 + AI 回答的完整记录</li>
            <li>AI 自己许下的 commitments</li>
            <li>Pulse 自动打的 10 类标签</li>
          </ul>

          <h3>2.3 我们<strong>不</strong>收集</h3>
          <ul>
            <li>真实姓名 / 身份证号 / 银行卡号</li>
            <li>通讯录 / 短信 / 通话记录</li>
            <li>浏览器 cookie 跨站追踪</li>
            <li>设备指纹 / IP 地理位置</li>
          </ul>

          <h2>3. 我们怎么用你的数据</h2>

          <h3>3.1 主要用途</h3>
          <ul>
            <li>给你的决策提供个性化分析 (注入到 prompt)</li>
            <li>跨决策保持连贯 (记得你之前说的)</li>
            <li>周期性蒸馏成 brain.md (让 AI "懂你")</li>
            <li>Weekly Review 识别你的人生模式</li>
            <li>Outcome Tracking 30/90/365 天回访</li>
          </ul>

          <h3>3.2 我们<strong>不</strong>做的</h3>
          <ul>
            <li>不卖给第三方</li>
            <li>不做广告投放画像</li>
            <li>不用你的数据训练我们的模型</li>
            <li>不分析为商业 insights 出售</li>
          </ul>

          <h2>4. 数据存哪 / 谁能访问</h2>

          <h3>4.1 数据存储</h3>
          <ul>
            <li>你的全部数据存在 KEY 的 VPS (位于中国大陆) 上的 SQLite 数据库</li>
            <li><strong>V0 阶段明文存储</strong> (诚实告知). V2 升级到加密存储.</li>
            <li>备份每日打包到独立存储, 保留 30 天</li>
          </ul>

          <h3>4.2 谁能访问</h3>
          <ul>
            <li><strong>只有 KEY 的工程师</strong> 在 debug / 用户支持时可访问</li>
            <li>我们不会未经你同意查看你的具体内容</li>
            <li>任何主动查看必须留 audit log</li>
          </ul>

          <h3>4.3 第三方</h3>
          <ul>
            <li>
              <strong>DeepSeek API</strong>: 我们调用 DeepSeek 给你做分析时, 会发送你<strong>当前对话内容</strong>给 DeepSeek, <strong>但不附带 user_uid</strong>. DeepSeek 的隐私政策: <a href="https://platform.deepseek.com/privacy" target="_blank" rel="noopener noreferrer">platform.deepseek.com/privacy</a>
            </li>
            <li>不与其他第三方共享</li>
          </ul>

          <h2>5. 你的权利</h2>
          <ul>
            <li><strong>查看权</strong>: 在 <Link href="/history">/history</Link> 和 <Link href="/brain">/brain</Link> 查看 AI 关于你的全部 memory + brain.</li>
            <li><strong>导出权</strong> (V1.5): 一键导出全部数据 (JSON 格式).</li>
            <li><strong>删除权</strong> (V1.5): 一键删除账号, 我们 7 天内删除全部数据 (含备份).</li>
            <li><strong>申诉权</strong>: 对处理有异议, 联系 TBD@email</li>
          </ul>

          <h2>6. 重要免责</h2>

          <h3>6.1 不替代专业咨询</h3>
          <p>
            KEY 是<strong>决策辅助工具</strong>, 不是:
          </p>
          <ul>
            <li>心理治疗师 / 精神科医生</li>
            <li>律师</li>
            <li>财务顾问 / 投资顾问</li>
            <li>内科医生</li>
          </ul>
          <p>
            涉及具体医疗 / 法律 / 投资问题, <strong>必须咨询专业人士</strong>. AI 输出仅供参考.
          </p>

          <h3>6.2 不诊断</h3>
          <p>
            我们不做任何疾病 (含心理疾病) 诊断. 如你有自伤 / 严重抑郁信号:
          </p>
          <ul>
            <li>北京心理危机干预中心 24h: <strong className="font-mono text-seal">010-82951332</strong></li>
            <li>全国心理援助热线: <strong className="font-mono text-seal">400-161-9995</strong></li>
          </ul>

          <h3>6.3 不承诺结果</h3>
          <p>
            AI 给的决策分析是基于决策科学的辅助框架, 不保证你的决定结果. 你的人生你决定.
          </p>

          <h2>7. 政策变更</h2>
          <p>
            如果隐私政策变更, 我们会通知:
          </p>
          <ul>
            <li>网站首页置顶 banner (变更前 7 天)</li>
            <li>下次登录时弹窗确认 (重大变更)</li>
          </ul>

          <h2>8. Cookie 政策</h2>
          <p>
            V0 我们<strong>只</strong>用 localStorage 存你的 user_uid (用于身份识别).
            不用 cookie. 不用第三方追踪 SDK.
          </p>

          <h2>9. 适用法律</h2>
          <p>V0 阶段:</p>
          <ul>
            <li>中国大陆用户: 遵循《个人信息保护法》(PIPL)</li>
            <li>海外用户: 遵循 GDPR (V1 加完整 GDPR 合规)</li>
          </ul>
        </article>

        <footer className="mt-16 pt-8 border-t border-paper-300 text-center font-mono text-xs text-ink-400">
          最后更新 2026-05 · 联系 TBD@email
        </footer>
      </main>
    </div>
  );
}
