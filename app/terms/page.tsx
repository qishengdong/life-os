import Link from 'next/link';

export const metadata = {
  title: '服务协议 — KEY',
};

export default function TermsPage() {
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
            · Terms of Service · v0.1 ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">
            服务协议
          </h1>
          <p className="font-mono text-xs text-ink-400">
            生效日期 TBD (上线前确定) · 上线前请律师 review
          </p>
        </header>

        <article className="prose prose-editorial max-w-none font-serif editorial-leading">

          <h2>1. 服务说明</h2>
          <p>
            KEY 是一个由 [运营主体 TBD] 提供的 AI 决策辅助 SaaS.
          </p>
          <p><strong>我们提供</strong>:</p>
          <ul>
            <li>基于决策科学的人生决策结构化分析</li>
            <li>跨决策的长期记忆 + AI 陪伴</li>
            <li>Daily Pulse 人生信号采集 + 周期性模式识别</li>
            <li>Outcome Tracking 决策结果跟踪</li>
          </ul>
          <p><strong>我们<strong>不</strong>提供</strong>:</p>
          <ul>
            <li>心理治疗 / 精神科诊断 / 处方</li>
            <li>法律意见 / 法律代理</li>
            <li>投资建议 / 财务规划</li>
            <li>医疗建议 / 治疗方案</li>
          </ul>

          <h2>2. 用户资格</h2>
          <ul>
            <li><strong>年龄</strong>: 必须 ≥18 岁</li>
            <li><strong>心理状态</strong>: 不在重度抑郁 / 自伤危机中. 如在, 请先联系专业心理援助</li>
            <li>同意本协议 + 隐私政策</li>
          </ul>

          <h2>3. 你的责任</h2>

          <h3>3.1 真实信息</h3>
          <p>
            提交的决策背景和 Pulse 应基本真实. 编故事 = 你自己骗自己, AI 帮不了你.
          </p>

          <h3>3.2 不替代专业</h3>
          <p>
            AI 分析仅供参考, 涉及法律 / 医疗 / 投资<strong>必须咨询专业</strong>.
          </p>

          <h3>3.3 健康使用</h3>
          <ul>
            <li>不要用 AI 替代真实人际关系</li>
            <li>不要每天 8 小时跟 AI 对话 — 这是病理性依赖, 我们会主动提醒你</li>
            <li>出现自伤 / 持续 2 周抑郁等信号, 立即求助专业</li>
          </ul>

          <h2>4. 我们的责任 + 边界</h2>

          <h3>4.1 服务尽力</h3>
          <p>
            我们承诺尽最大努力让 AI 输出有质量. 但 AI 不是万能.
          </p>

          <h3>4.2 可用性</h3>
          <p>
            V0 不承诺 SLA. V1 后达到 99% 月可用性.
          </p>

          <h3>4.3 数据安全</h3>
          <p>
            见<Link href="/privacy">隐私政策第 4 条</Link>.
          </p>

          <h3>4.4 不可抗力</h3>
          <p>
            因不可抗力 (政策变化 / 网络中断 / DeepSeek 服务变化) 导致服务中断, 不承担责任.
          </p>

          <h3>4.5 责任上限</h3>
          <p>
            任何情况下, 我们的赔偿上限为你<strong>已支付费用的 12 个月总额</strong>.
            因 AI 输出导致的间接损失 (失业 / 离婚 / 错失机会), 不承担责任.
          </p>

          <h2>5. 付费</h2>
          <p>(V1 上线后启用)</p>

          <h3>5.1 价格</h3>
          <p>
            详见 <Link href="/pricing">定价页</Link>:
            Free 永久免费 / Pro ¥99 月 / Premium ¥299 月.
          </p>

          <h3>5.2 退款</h3>
          <p>
            7 天内未使用可全额退款. 已使用部分按比例退.
          </p>

          <h3>5.3 续费</h3>
          <p>
            默认不自动续费. 到期前 3 天提醒.
          </p>

          <h2>6. 禁止行为</h2>
          <p>不能:</p>
          <ul>
            <li>用 KEY 试图获取自伤 / 伤人方法</li>
            <li>滥用 AI 帮其他人 (KEY 是 1对1 长期关系)</li>
            <li>攻击系统 / 反向工程</li>
            <li>抓取 / 转售 AI 输出</li>
            <li>创建多账号绕过限额</li>
          </ul>
          <p>
            违反 → 立即封号, 已付费<strong>不退</strong>.
          </p>

          <h2>7. 知识产权</h2>

          <h3>7.1 你的内容</h3>
          <p>
            你输入的所有内容 (Pulse / 决策描述 / 答案) 知识产权归你.
          </p>

          <h3>7.2 AI 输出</h3>
          <p>
            AI 给你的分析, 你可以自由使用 (含商用、转载、修改).
          </p>

          <h3>7.3 我们的</h3>
          <p>
            KEY 的 brand / 代码 / 决策框架 / Synthetic personas 库 等知识产权归我们.
          </p>

          <h2>8. 协议变更</h2>
          <p>
            我们可能更新协议. 重大变更前 30 天通知.
            变更后你继续使用 = 同意.
          </p>

          <h2>9. 争议解决</h2>
          <p>V0:</p>
          <ul>
            <li>协商优先</li>
            <li>协商不成: 运营主体所在地法院</li>
          </ul>
          <p>V1+ 加仲裁条款.</p>

          <h2>10. 接受协议</h2>
          <p>
            打开 KEY 网站 + 提交第一个 Pulse / 决策 = 同意本协议.
          </p>
        </article>

        <footer className="mt-16 pt-8 border-t border-paper-300 text-center font-mono text-xs text-ink-400">
          最后更新 2026-05 · 联系 TBD@email
        </footer>
      </main>
    </div>
  );
}
