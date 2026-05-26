/**
 * /essay/relational-drain-as-risk — 关系内耗作为决策风险信号 · 5/22 ship · Essay 2
 *
 * 基于 GPT 5/22 写作 + KEY voice 微调.
 *
 * 战略意义:
 *   - Essay 1 (元认知) 是战略/思想深度版 (投资人 + 知识分子)
 *   - Essay 2 (你妈电话) 是日常 hook + 朋友圈爆款版 (Linda × 5 + 朋友圈)
 *   - 两版互补, 服务不同 audience
 *
 * 9 段硬模板 (doctrine v4 ch.28):
 *   1. 开场 · 真社交媒体语料
 *   2. 核心 Reframe (情绪 → 风险)
 *   3. Signal · 真信号
 *   4. Risk · 标记 + 长期路径
 *   5. Brief · 真问题重述
 *   6. Risk Review · 5 个开放问句 (第 1 条改 KEY 克制版)
 *   7. Action · 7 天小实验
 *   8. Review · 30 天 5 问
 *   9. 收尾 · KEY 杀手句自然走到
 */
import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export const metadata = {
  title: 'KEY · 为什么你妈一打电话, 你就很累?',
  description: '这不是简单的情绪问题. 这是边界风险. KEY 在做的, 是在它变成家庭危机、身体崩溃或重大错误决定之前, 帮你看见它.',
};

export default function RelationalDrainEssayPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/why-key" className="hover:text-seal-500 transition-colors">为什么 KEY</Link>
          <Link href="/how-it-works" className="hover:text-seal-500 transition-colors">如何工作</Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">加入</Link>
        </div>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        <header className="pt-12 pb-12 text-center border-b border-paper-300">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · KEY · ESSAY · 2 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.05] mb-8">
            为什么你妈一打电话,<br />你就很累?
          </h1>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed mb-6">
            不是你脆弱, 而是你被放进了一个<br />
            逃不掉、打不回、又不能不爱的关系里.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            2026 · 5 月 · 北京 · 约 2000 字 · 阅读 6 分钟
          </p>
        </header>

        <article className="pt-16 font-serif text-reading text-ink-700 editorial-leading space-y-6">

          {/* I. 开场 · 真社交媒体语料 */}
          <p>
            有人在网上说:
          </p>
          <blockquote className="font-serif italic text-[17px] text-ink-900 leading-relaxed border-l-2 border-seal-500 pl-6 my-6">
            每次我妈给我打电话, 我都会觉得很累.<br />
            她往手机里加了什么?
          </blockquote>
          <p>
            我回了一句:
          </p>
          <blockquote className="font-serif italic text-[17px] text-ink-900 leading-relaxed border-l-2 border-seal-500 pl-6 my-6">
            她加的不是东西, 是情绪内耗.<br />
            你既不能拉黑, 又不能打她, 当然累.
          </blockquote>
          <p className="font-serif italic text-ink-500">
            这句话粗糙, 但很准.
          </p>

          {/* II. 结构性分析 */}
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mt-12 mb-6">
            一. 逃不掉, 打不回, 还不能说自己不爱
          </h2>
          <p>
            <strong>"不能拉黑"</strong>, 意味着逃跑路线被切断.
            在孝道、血缘和家庭责任里, 你很难像删除一个普通联系人那样, 彻底退出这段关系.
          </p>
          <p>
            <strong>"不能打她"</strong>, 意味着反击路径也被封死.
            你不能攻击, 不能撕破脸, 不能把愤怒完整表达出来. 否则你立刻被放到"不孝""不懂事""白养你了"的道德审判里.
          </p>
          <p>
            于是问题来了:
          </p>
          <p className="pl-6 border-l-2 border-seal-500/40 italic">
            逃不掉.<br />
            打不回.<br />
            还不能说自己不爱.
          </p>
          <p>
            所有能量只能向内塌缩. 这就是内耗.
          </p>

          {/* III. 父母是主体, 子女是客体 */}
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mt-12 mb-6">
            二. 父母始终拥有一种特殊权力 — 重新把你变回"孩子"
          </h2>
          <p>
            很多成年子女最痛苦的地方, 不是父母说了多难听的话. 而是父母始终拥有一种特殊权力:
          </p>
          <p className="font-serif italic text-[17px] text-ink-900 leading-relaxed border-l-2 border-seal-500 pl-6 my-6">
            他们可以重新把你变回"孩子".
          </p>
          <p>
            你明明已经工作、成家、赚钱、承担责任. 但只要一个电话、一句否定、一个失望的语气, 你又被拖回那个位置:
          </p>
          <ul className="space-y-2 pl-6 font-serif italic text-ink-700">
            <li>· 被评价.</li>
            <li>· 被定义.</li>
            <li>· 被要求懂事.</li>
            <li>· 被要求体谅.</li>
            <li>· 被要求永远不要让父母失望.</li>
          </ul>
          <p>
            这才是很多中国式亲子关系最深的结构问题:
          </p>
          <p className="font-serif italic text-[17px] text-ink-900 leading-relaxed border-l-2 border-seal-500 pl-6 my-6">
            父母是主体, 子女是客体.
          </p>
          <p>
            父母可以定义你. 你却很难定义边界.<br />
            父母的控制, 被解释成关心.<br />
            父母的越界, 被解释成负责.<br />
            父母的情绪, 被解释成爱.<br />
            而你的反抗, 很容易被解释成不孝.
          </p>

          {/* IV. 核心 Reframe · 情绪 → 风险 */}
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mt-12 mb-6">
            三. 这不是简单的情绪问题. 这是边界风险.
          </h2>
          <p>
            所以很多人不是不成熟, 也不是太敏感.
          </p>
          <p>
            而是长期处在一种关系结构里:
          </p>
          <p className="pl-6 border-l-2 border-seal-500/40 italic">
            不能真正退出.<br />
            不能真正反击.<br />
            不能真正表达愤怒.<br />
            只能不断消耗自己来维持表面的和平.
          </p>
          <p className="font-serif italic text-[17px] text-ink-900 leading-relaxed pt-4 border-t border-paper-300">
            这不是简单的情绪问题. 这是边界风险.
          </p>

          {/* V. KEY 的视角 · 5-step 完整演示 */}
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mt-16 mb-6">
            四. 用 KEY 的视角看这件事
          </h2>
          <p>
            如果这件事进入 KEY, 它不会被当成一条普通日记, 也不会被当成"原生家庭情绪疗愈".
          </p>
          <p>
            KEY 会把它跑完 5 步真闭环:
          </p>

          {/* Step 1 · Signal */}
          <div className="my-8 border-l-2 border-seal-500 pl-6 py-4 bg-paper-50">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              · Step 1 · Signal · 日常信号 ·
            </p>
            <p className="font-serif italic text-ink-900 mb-2">
              "每次妈妈打电话, 我都觉得很累."
            </p>
            <p className="text-[14px] text-ink-500">
              这不是小事. 这是一个**高频、重复、带身体反应**的关系信号. KEY verbatim 存档.
            </p>
          </div>

          {/* Step 2 · Risk */}
          <div className="my-8 border-l-2 border-seal-500 pl-6 py-4 bg-paper-50">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              · Step 2 · Risk · 风险标记 ·
            </p>
            <p className="font-serif text-ink-900 mb-3">
              KEY 会标记为:<br />
              <span className="font-serif italic text-[14px] text-ink-700">
                父母关系 / 边界塌陷 / 不可退出关系 / 愧疚驱动 / 情绪内耗风险
              </span>
            </p>
            <p className="text-[14px] text-ink-700 mb-3">
              这类关系最危险的, 不是一次电话让你累. 而是它可能长期侵蚀你的:
            </p>
            <ul className="space-y-1 pl-4 text-[14px] text-ink-700">
              <li>· 睡眠</li>
              <li>· 情绪稳定</li>
              <li>· 伴侣关系</li>
              <li>· 对孩子的耐心</li>
              <li>· 工作判断力</li>
              <li>· 对父母养老的清醒决策</li>
            </ul>
          </div>

          {/* Step 3 · Brief */}
          <div className="my-8 border-l-2 border-seal-500 pl-6 py-4 bg-paper-50">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              · Step 3 · Brief · 真问题重述 ·
            </p>
            <p className="text-[14px] text-ink-700 mb-3">
              KEY 不会问 "你要不要拉黑你妈?" — 这太粗暴. KEY 会把问题重新定义成:
            </p>
            <p className="font-serif italic text-ink-900">
              "你和母亲之间的沟通边界, 是否已经到了需要重设的阶段?"
            </p>
          </div>

          {/* Step 4 · Risk Review 5 问 */}
          <div className="my-8 border-l-2 border-seal-500 pl-6 py-4 bg-paper-50">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              · Step 4 · Risk Review · 5 个开放风险问 ·
            </p>
            <ol className="space-y-3 text-[14px] text-ink-700 list-decimal pl-6">
              <li>
                <strong>你区分"愧疚"和"责任"了吗?</strong>
                上次跟妈妈通完电话后, 你当时是哪种感觉?
              </li>
              <li>
                <strong>你是否低估了长期消耗?</strong>
                一通电话没什么, 但一年 100 通会改变你的身体和关系状态.
              </li>
              <li>
                <strong>你是否没有安全的退出路径?</strong>
                你能不能结束一次通话, 而不陷入巨大自责?
              </li>
              <li>
                <strong>你是否一直在用沉默维持和平?</strong>
                如果每次都忍, 关系看似稳定, 实际风险在积累.
              </li>
              <li>
                <strong>这件事是否会影响未来更大的决定?</strong>
                父母养老、同住、请护工、医疗决策、财务支持、伴侣冲突 — 这些大决定都会被今天的小累影响.
              </li>
            </ol>
          </div>

          {/* Step 5 · Action */}
          <div className="my-8 border-l-2 border-seal-500 pl-6 py-4 bg-paper-50">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              · Step 5 · Action · 最小验证动作 ·
            </p>
            <p className="text-[14px] text-ink-700 mb-3">
              KEY 不会让你立刻摊牌. KEY 给的不是"断亲"或"忍耐". 是一个小实验:
            </p>
            <div className="border border-seal-500/40 p-4 bg-paper mb-3">
              <p className="text-[14px] text-ink-900 mb-2">
                <strong>未来 7 天</strong>, 把和妈妈的通话控制在 15 分钟内. 结束前只说一句固定话:
              </p>
              <p className="font-serif italic text-ink-900 mb-3">
                "妈, 我先去忙了, 晚点有空再说."
              </p>
              <p className="text-[14px] text-ink-700">
                不解释, 不争辩, 不证明自己不是坏孩子.
              </p>
            </div>
            <p className="text-[14px] text-ink-700 mb-2">然后记录三件事:</p>
            <ol className="space-y-1 pl-6 text-[14px] text-ink-700 list-decimal">
              <li>她是否升级情绪?</li>
              <li>你是否强烈自责?</li>
              <li>通话后的疲惫是否下降?</li>
            </ol>
            <p className="mt-3 font-serif italic text-[13px] text-ink-500">
              这不是为了改变你妈. 而是为了验证: 你的边界是否还有被建立的可能.
            </p>
          </div>

          {/* Step 6 · Review */}
          <div className="my-8 border-2 border-seal-500 p-6 bg-paper">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              · 30 天后 · KEY 回来复盘 ·
            </p>
            <ul className="space-y-2 text-[14px] text-ink-700">
              <li>· 通话后的疲惫感有没有下降?</li>
              <li>· 你是否更敢结束通话?</li>
              <li>· 母亲是否接受了新的沟通节奏?</li>
              <li>· 你是否仍然被愧疚控制?</li>
              <li>· 这件事是否需要升级成一份完整的父母边界决策简报?</li>
            </ul>
          </div>

          {/* VI. 收尾 · KEY 的真位置 */}
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mt-16 mb-6">
            五. KEY 解决的不是"怎么跟妈妈聊天"
          </h2>
          <p>
            KEY 真正解决的, 是:
          </p>
          <p className="font-serif italic text-[17px] text-ink-900 leading-relaxed border-l-2 border-seal-500 pl-6 my-6">
            在一个日常小信号里, 提前发现未来可能让你后悔的关系风险.
          </p>
          <p>
            很多人生大问题, 不是一夜之间发生的. 它们往往开始于:
          </p>
          <ul className="space-y-1 pl-6 font-serif italic text-ink-700">
            <li>· 一次不想接但还是接了的电话.</li>
            <li>· 一句想反驳但咽下去的话.</li>
            <li>· 一次明明很累却继续扮演好孩子的沉默.</li>
          </ul>
          <p className="pt-4 border-t border-paper-300">
            KEY 的价值, 就是在这些小信号变成家庭危机、身体崩溃或重大错误决定之前, 帮你看见它.
          </p>
          <p className="pt-4 font-serif italic text-[17px] text-ink-900">
            一句话:
          </p>
          <p className="font-serif text-[20px] text-ink-900 tracking-tightish leading-snug pt-2">
            <strong>KEY 不替你做决定.<br />KEY 帮你在后悔之前, 看清风险.</strong>
          </p>

          {/* 落款 */}
          <div className="mt-20 pt-12 border-t border-paper-300 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400 mb-4">
              · KEY · ESSAY 2 · 2026 春 ·
            </p>
            <p className="font-serif italic text-[14px] text-ink-500 mb-8">
              这是 KEY 真实案例库的第 1 个 case. 后续还有 9 个 — 关系 / 婚姻 / 子女 / 事业 / 资产 / 自我.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/why-key"
                className="inline-block px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
              >
                看 KEY 战略叙事 →
              </Link>
              <Link
                href="/invite"
                className="inline-block px-8 py-3 font-serif text-base border-2 border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper transition-colors"
              >
                已有邀请码 → 激活
              </Link>
            </div>
            <p className="mt-8 font-mono text-[10px] text-ink-400">
              <Link href="/essay/metacognition" className="hover:text-seal-500">
                · 读 Essay 1 · 元认知作为 AI 时代真成长 →
              </Link>
            </p>
          </div>
        </article>

        <footer className="pt-20 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在境外节点 · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
