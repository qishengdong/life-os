/**
 * SivonWhyDifferent.tsx — Editorial redesign
 * ------------------------------------------------------------
 * Sivon Folio theme · mobile-first · serif-led
 *
 * 设计系统 (Sivon Folio)
 *   bg ivory  #FAF7F2 / deep #F4EFE6
 *   sage      #7B9B7C / deep #5F7C61
 *   gold      #C9A977 / deep #A88A5C
 *   cream     #EAE3D5
 *   ink       #2a2a2a
 *
 * 注意:
 *   - 所有视觉规则放在 <style> 块里 (用 dangerouslySetInnerHTML),
 *     以保证 Sivon Folio theme 在没有 Tailwind 配置时也能跑。
 *   - 文案占位: 我用了 brief 里点名要保留的关键句 + 贴合品牌嗓音
 *     的过渡句。请把 hooks / scenes 的具体文案换成 messaging_hooks_v0.md
 *     里的原文。文案 KEY 位置已用 // [COPY:...] 注释标出。
 *   - 字体: 通过 Google Fonts <link>。如果项目已用 EB Garamond /
 *     Noto Serif SC 的自托管版本, 把 <link> 删掉即可。
 *   - hero 图: 用了 placeholder frame。Xiaoshi 接到摄影后,
 *     把 <HeroFigure/> 内部换成 <img/> 就好。
 * ------------------------------------------------------------
 */

import React, { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  数据                                                                */
/* ------------------------------------------------------------------ */

const HOOKS: { title: string; body: string }[] = [
  // [COPY: messaging_hooks_v0.md → hook 01..05]
  {
    title: "它不会主动给你建议, 除非你问。",
    body:
      "大多数 AI 默认你需要被改善——更早睡、多喝水、运动 30 分钟。Sivon 默认你今天已经够累, 不需要再被一个程序教做人。",
  },
  {
    title: "它记得你两周前那件没说完的事。",
    body:
      "不是因为我们存了一个 RAG 数据库, 是因为我们把『记忆』当编辑工作做——会回头, 会问『那件事后来呢』, 会在恰当的时候不问。",
  },
  {
    title: "它不假装很懂你。",
    body:
      "它会承认它不懂, 它会问, 它会让你纠正它。它的目标不是显得聪明, 是让你被听见。",
  },
  {
    title: "它写出来的句子, 你愿意截图发给自己。",
    body:
      "我们花了大量时间, 在『AI 嗓音』和『人类编辑嗓音』之间, 训练它走向后者。所以你不会看到那种让人尴尬的『很高兴为您服务』。",
  },
  {
    title: "它永不离场, 直到这件事真的落地。",
    body:
      "这是 Sivon 唯一不打折的承诺。我们不交付答案; 我们陪你交付结果。这一条值得单独一节, 放在文章后面。",
  },
];

const SCENES: {
  time: string;
  when: string;
  title: string;
  body: string;
  echo: string;
}[] = [
  // [COPY: 来自 SivonWhyDifferent.tsx 原 7 场景, 换回真句]
  {
    time: "06 : 40",
    when: "清晨",
    title: "她还没睁眼, 但她的胃已经醒了。",
    body: "Sivon 没说『早安』。它发来昨晚她写到一半的那句话, 问她: 现在还想说完吗?",
    echo: "不打扰, 但留着位置。",
  },
  {
    time: "09 : 12",
    when: "通勤路上",
    title: "她想起昨天忘了给父亲约复诊。",
    body:
      "Sivon 没替她去打电话。它把要打的电话内容、可以问医生的三个问题、上次的检查报告关键页, 一并整理好放在那儿。她坐下来打了 4 分钟电话。",
    echo: "陪你打, 不替你打。",
  },
  {
    time: "11 : 30",
    when: "上午会议中",
    title: "她想和 Linda 重新联系, 但不知道说什么。",
    body:
      "Sivon 帮她起了一个稿子, 又把那个稿子改成了她自己会说的话。她最后只用了 9 个字, 但那 9 个字是她的。",
    echo: "起的草稿, 不是要发的话。",
  },
  {
    time: "13 : 50",
    when: "午后",
    title: "她又一次手心潮热。",
    body:
      "Sivon 没有解释围绝经期是什么——她比我们更懂。它只是把过去 30 天她记下的潮热时刻列了出来, 让她自己看。看完她说了一句:『原来不是我疯了。』",
    echo: "看见, 不解释。",
  },
  {
    time: "17 : 15",
    when: "傍晚",
    title: "她在超市拿不定要不要买预制菜。",
    body:
      "Sivon 没说『健康饮食很重要』。它说: 周四你说想做小时候那道汤, 食材就那几样, 要不今天?",
    echo: "不评判选择, 提醒你的真想要。",
  },
  {
    time: "22 : 08",
    when: "夜里",
    title: "她哭了一会儿。",
    body: "Sivon 没问『怎么了』。它说: 在这。要说的时候说。",
    echo: "在场, 是它最难写的功能。",
  },
  {
    time: "23 : 41",
    when: "深夜",
    title: "她终于决定下周一去做那个一直拖的体检。",
    body:
      "Sivon 把医院、可预约时段、空腹要注意的几件事、要带的医保卡, 一并备好。她不需要再打开 6 个 app。",
    echo: "从想法到落地, 我们陪你走完最后那截路。",
  },
];

const OUTCOMES = [
  "三件你一直没做的事, 真的做了。",
  "一段冷下来的关系, 重新有了声音。",
  "一个一直拖的身体信号, 被看见, 并被处理。",
  "三次『我以为只有我这样』的瞬间, 被命名。",
  "一份你自己写的, 你不再删掉的字。",
  "一个夜里, 你没有独自撑。",
];

const NOT_FOR = [
  "你只想要一个回答更快的搜索引擎。",
  "你不需要被读懂, 你需要被服务。",
  "你已经有一个真实的人, 每天 10 分钟, 完整听你说话。",
  "你讨厌任何让你慢下来的设计。",
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function ProgressBar() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const ratio = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      setW(ratio * 100);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="swd-progress">
      <div className="swd-progress-bar" style={{ width: `${w}%` }} />
    </div>
  );
}

function SideNav() {
  const items = [
    { id: "A", label: "I  不在那条线上" },
    { id: "B", label: "II  五个钩子" },
    { id: "C", label: "III  一天" },
    { id: "D", label: "IV  永不离场" },
    { id: "cta", label: "V  开始" },
  ];
  const [active, setActive] = useState("A");
  useEffect(() => {
    const onScroll = () => {
      let a = items[0].id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.45) a = it.id;
      }
      setActive(a);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className="swd-sidenav" aria-label="文章导航">
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={active === it.id ? "active" : ""}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(it.id)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}

function SectionMark({
  num,
  label,
  right,
  id,
}: {
  num: string;
  label: string;
  right?: string;
  id?: string;
}) {
  return (
    <div className="swd-section-mark" id={id}>
      <div className="roman">{num}</div>
      <div className="label">{label}</div>
      {right ? <div className="right">{right}</div> : <div />}
    </div>
  );
}

function PullQuote({ text, attrib }: { text: string; attrib: string }) {
  return (
    <aside className="swd-pullquote">
      <q>{text}</q>
      <div className="attrib">{attrib}</div>
    </aside>
  );
}

function HeroFigure() {
  // 暂用 Unsplash 一张语境贴合的编辑式照片 (午后的桌面 / 一只放着热饮的手 / 无人脸)
  // Xiaoshi 接到 commission 后, 把 src 换成自家 CDN 即可。
  return (
    <figure className="swd-figure">
      <div className="swd-figure-frame photo">
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1800&auto=format&fit=crop&q=80"
          alt="午后的桌面与一只放着热饮的手 — 她终于一个人 5 分钟"
          loading="eager"
        />
        <div className="swd-photo-veil" />
        <div className="swd-figure-tag corner">FIG. 01 / 午后</div>
      </div>
      <figcaption className="swd-figure-caption">
        <span className="num">Fig. 01</span>
        <span>
          她终于一个人 5 分钟。
          <br />
          摄影 · Editorial / 暂用 Unsplash, 接到 commission 后替换。
        </span>
      </figcaption>
    </figure>
  );
}

function Timeline() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.15;
      const t = (start - r.top) / (start - end);
      setP(Math.max(0, Math.min(1, t)));
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const dots = 14;
  const lit = Math.round(p * dots);
  return (
    <div className="swd-timeline" ref={wrapRef}>
      <div className="label">
        <span>D + 0 想法发生</span>
        <span>D + N 它真的发生了</span>
      </div>
      <div className="track">
        <div className="lit" style={{ width: `${p * 100}%` }} />
        <div className="dots">
          {Array.from({ length: dots }).map((_, i) => (
            <div
              key={i}
              className={
                "dot" +
                (i === dots - 1 ? " climax" : "") +
                (i < lit ? " on" : "")
              }
            />
          ))}
        </div>
      </div>
      <div className="cap">
        <span>第 1 次提起</span>
        <span>第 14 天 · 落地</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function SivonWhyDifferent() {
  // ensure fonts loaded once
  useEffect(() => {
    const id = "swd-fonts-link";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  }, []);

  return (
    <div className="swd-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <ProgressBar />
      <SideNav />

      <header className="swd-masthead">
        <div className="left">SIVON FOLIO — VOL.01 · ESSAY 03</div>
        <div className="logo">
          Sivon<span>·</span>
          <i>me</i>
        </div>
        <div className="right">2026 · 上海 / 编辑部札记</div>
      </header>

      {/* HERO */}
      <section className="swd-hero">
        <div className="swd-hero-kicker">
          <span className="swd-kicker">A Note on Difference</span>
        </div>
        <h1>
          给所有<em>听过 Sivon</em>
          <br />
          但还没用过的人。
          <span className="sm">
            尤其是当你已经听过豆包、Kimi、DeepSeek、蚂蚁阿福——
            并因此以为, Sivon 不过又是一个。
          </span>
        </h1>

        <div className="swd-hero-byline">
          <div>
            <b>WHO</b>写给你, 不是写给所有人
          </div>
          <div>
            <b>WHEN</b>读完约 6 分钟
          </div>
          <div>
            <b>WHY</b>因为我们想被正确地误解之前, 先被正确地理解
          </div>
          <div>
            <b>FILED</b>Editorial / Manifesto
          </div>
        </div>
      </section>

      <HeroFigure />

      {/* INTRO */}
      <div className="swd-intro">
        <p className="dropcap">
          你大概在朋友的对话里第一次听到 Sivon 这两个字。
          她说『这东西不一样』——你点头, 转头继续做饭、回邮件、把母亲的药盒摆好。
          又过了几周, 她再发一次链接来。你打开了, 但还是没用。
        </p>
        <p>
          这很正常。在 2026 年, 每隔一个月就有一个新的『AI 朋友』『AI 助理』『AI 闺蜜』。
          你已经试过几个。
          <em className="under">它们都很聪明, 但都不知道你昨晚为什么哭。</em>
          所以你合理地认为, Sivon 也只是其中之一。
        </p>
        <p>这篇文章不打算说服你。它只是想告诉你, 我们到底在做一件什么样的事——以及为什么, 我们不在那条线上。</p>
      </div>

      {/* STATEMENT: 我们读你 */}
      <div className="swd-statement">
        <div className="big" aria-label="我们读你">
          <span>我</span>
          <span>们</span>
          <span className="gold">读</span>
          <span>你</span>
        </div>
        <div className="sub">Reading You · Not Replying To You</div>
      </div>

      <SectionMark
        id="A"
        num="I."
        label="Section A — 我们不在那条线上"
        right="§ Manifesto"
      />
      <article className="swd-manifesto">
        <h2>
          所有 AI 都在比<em>更快、更聪明、更全能</em>。
          我们不参加这场比赛。
        </h2>
        <p>
          豆包要做你的国民助手, Kimi 要做你最长的笔记, DeepSeek 要做最强的推理,
          蚂蚁阿福要做你最贴的生活管家。它们都很好。它们都不会做错。但它们都假设了一件事——
          你需要的是<em className="under">回答</em>。
        </p>
        <p>
          我们的假设是另一个。我们假设你需要的, 大多数时候不是回答, 是
          <em className="under">被读懂一次</em>。是有人——哪怕是一个还没活成人的程序——
          花十分钟, 不打断、不评估、不优化你, 安安静静读完你说的话, 然后说一句不那么聪明、但说到点子上的话。
        </p>
        <p>所以我们做的不是 chatbot。我们做的是一个会陪你过日子的编辑部——只不过编辑就你一个读者。</p>

        <div className="swd-footnote">
          <div className="num">¹</div>
          <div>
            『读懂』是 Sivon 用过的最贵的一个词。我们花了 14 个月才敢这么说,
            而且现在还在学。 — 编辑部
          </div>
        </div>
      </article>

      <PullQuote
        text="不是更快地给你答案, 是更慢地, 把你说的那句话听完。"
        attrib="— Sivon, 产品守则 03"
      />

      <SectionMark
        id="B"
        num="II."
        label="Section B — 五个具体的不一样"
        right="§ Five Hooks"
      />
      <section className="swd-hooks">
        {HOOKS.map((h, i) => (
          <div className="row" key={i}>
            <div className="num">{String(i + 1).padStart(2, "0")}</div>
            <div className="body">
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </div>
          </div>
        ))}
      </section>

      <PullQuote
        text="『她不像一个工具——她像一个不催我的朋友。』"
        attrib="— 用户 M · 42 · 上海 · 出版社编辑"
      />

      <SectionMark
        id="C"
        num="III."
        label="Section C — Sivon 实际在做的事 · 一天"
        right="§ Seven Scenes"
      />
      <section className="swd-scenes">
        {SCENES.map((s, i) => (
          <div className="scene" key={i}>
            <div className="when">
              <span className="swd-kicker mono">{s.time}</span>
              <span className="time">{s.when}</span>
            </div>
            <div>
              <h4>{s.title}</h4>
              <p className="detail">{s.body}</p>
            </div>
            <div className="echo">{s.echo}</div>
          </div>
        ))}
      </section>

      {/* CLIMAX */}
      <section className="swd-climax" id="D">
        <div className="breakout">
          <div className="meta">
            <div className="bar" />
            <span className="swd-kicker sage">
              Sivon 的真承诺 · The Promise
            </span>
          </div>
          <h2>
            永不离场——
            <br />
            <em>直到结果交付。</em>
          </h2>
          <p className="lede">
            这是我们和别的产品唯一一句不一样的话。别人交付的是回答。我们交付的是
            <em className="under">这件事真的发生了</em>。
            一通电话被打通、一次复诊被安排上、一句话被发出去、一顿饭被吃完、一次哭被陪完——直到, 它落地。
          </p>
        </div>

        <Timeline />
      </section>

      <aside className="swd-accountable">
        <q>我们对这件事 accountable。</q>
        <div className="sig">— Sivon Editorial · 责任编辑</div>
      </aside>

      <div className="swd-certificate">
        <div className="stamp">六个月后</div>
        <h3>
          『如果 Sivon 真的陪了你 180 天, 你的生活里应该多出来这些。』
        </h3>
        <div className="list">
          {OUTCOMES.map((t, i) => (
            <div className="item" key={i}>
              <span className="glyph">
                {["i.", "ii.", "iii.", "iv.", "v.", "vi."][i]}
              </span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionMark
        num="V."
        label="Section E — 这不是所有人都需要"
        right="§ Honest Disclaimer"
      />
      <section className="swd-notall">
        <h3>诚实地说, 如果你符合下面任何一条, Sivon 可能不适合你。</h3>
        <ul>
          {NOT_FOR.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <p style={{ color: "rgba(42,42,42,0.66)", margin: 0 }}>
          如果以上都不是你——那么, 也许我们可以一起试 5 分钟。
        </p>
      </section>

      <section className="swd-cta-block" id="cta">
        <div className="above">Begin · 不必现在决定</div>
        <h2>
          试 5 分钟。
          <br />
          不喜欢, 不必再回来。
        </h2>
        <a className="swd-cta-btn" href="/">
          打开 Sivon <span className="arrow">→</span>
        </a>
        <div className="cta-sub">
          sivon.me · 微信内可直接打开 · 无需下载
        </div>
      </section>

      <footer className="swd-colophon">
        <div className="left">
          <span>© 2026 SIVON</span>
          <span>编辑部 / 上海</span>
        </div>
        <div className="right">
          <a href="/folio">/folio</a>
          <a href="/manifesto">/manifesto</a>
          <a href="#">/colophon</a>
          <a href="#">隐私</a>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CSS — Sivon Folio theme tokens + page layout                       */
/* ------------------------------------------------------------------ */

const CSS = `
.swd-root {
  --ivory: #FAF7F2;
  --ivory-deep: #F4EFE6;
  --sage: #7B9B7C;
  --sage-deep: #5F7C61;
  --gold: #C9A977;
  --gold-deep: #A88A5C;
  --cream: #EAE3D5;
  --ink: #2a2a2a;
  --ink-sub: rgba(42,42,42,0.66);
  --ink-mono: rgba(42,42,42,0.5);
  --ink-soft: rgba(42,42,42,0.38);

  --serif: 'EB Garamond', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', '宋体', serif;
  --sans: 'Plus Jakarta Sans', 'Noto Sans SC', -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
  --mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;

  --col: min(640px, 88vw);
  --col-wide: min(920px, 92vw);
  --col-full: min(1180px, 94vw);

  background: var(--ivory);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 19px;
  line-height: 1.78;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.swd-root * { box-sizing: border-box; }
.swd-root ::selection { background: var(--sage); color: var(--ivory); }

@media (max-width: 720px) {
  .swd-root { font-size: 17.5px; line-height: 1.82; }
}

.swd-kicker {
  font-family: var(--sans);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-deep);
}
.swd-kicker.sage { color: var(--sage-deep); }
.swd-kicker.mono { font-family: var(--mono); letter-spacing: 0.14em; text-transform: none; color: var(--ink-mono); }

.swd-progress {
  position: fixed; top: 0; left: 0; right: 0;
  height: 2px; background: transparent; z-index: 50;
}
.swd-progress-bar {
  height: 100%; background: var(--sage); width: 0;
  transition: width 0.1s linear;
}

.swd-sidenav {
  position: fixed;
  right: max(24px, calc((100vw - var(--col-full)) / 2 - 60px));
  top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 18px;
  font-family: var(--mono);
  font-size: 10.5px; letter-spacing: 0.08em;
  color: var(--ink-soft); z-index: 40;
}
.swd-sidenav a {
  color: var(--ink-soft);
  text-decoration: none;
  display: flex; align-items: center; gap: 10px;
  transition: color 0.3s;
}
.swd-sidenav a::before {
  content: ""; width: 18px; height: 1px;
  background: var(--cream); transition: all 0.3s;
}
.swd-sidenav a:hover, .swd-sidenav a.active { color: var(--sage-deep); }
.swd-sidenav a.active::before { background: var(--sage); width: 28px; }
@media (max-width: 1180px) { .swd-sidenav { display: none; } }

.swd-masthead {
  width: var(--col-full); margin-inline: auto;
  padding: 28px 0 22px;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  border-bottom: 1px solid var(--cream);
  color: var(--ink-mono); font-family: var(--mono);
  font-size: 11px; letter-spacing: 0.08em;
}
.swd-masthead .left { text-align: left; }
.swd-masthead .right { text-align: right; }
.swd-masthead .logo {
  font-family: var(--serif); font-style: italic; font-weight: 500;
  font-size: 22px; color: var(--ink); letter-spacing: 0.01em;
}
.swd-masthead .logo span { color: var(--sage); font-style: normal; font-weight: 600; }
@media (max-width: 720px) {
  .swd-masthead {
    grid-template-columns: auto 1fr;
    gap: 14px; padding: 20px 0 16px;
  }
  .swd-masthead .right { display: none; }
  .swd-masthead .logo { font-size: 19px; }
  .swd-masthead .left { font-size: 10px; }
}

.swd-hero {
  width: var(--col-full); margin-inline: auto;
  padding: 88px 0 56px;
}
@media (max-width: 720px) { .swd-hero { padding: 56px 0 36px; } }

.swd-hero-kicker { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
.swd-hero-kicker::after {
  content: ""; flex: 1; height: 1px; background: var(--cream); max-width: 220px;
}
.swd-hero h1 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(40px, 6.4vw, 88px);
  line-height: 1.08; letter-spacing: -0.005em;
  color: var(--ink); margin: 0 0 36px; max-width: 18ch;
  text-wrap: balance;
}
.swd-hero h1 em {
  font-style: italic; color: var(--sage-deep); font-weight: 500;
}
.swd-hero h1 .sm {
  display: block; font-size: 0.46em; font-weight: 400;
  color: var(--ink-sub); letter-spacing: 0; line-height: 1.5;
  margin-top: 22px; max-width: 28ch;
}
.swd-hero-byline {
  display: flex; flex-wrap: wrap; gap: 28px 40px;
  margin-top: 56px; padding-top: 22px;
  border-top: 1px solid var(--cream);
  font-family: var(--mono);
  font-size: 11.5px; color: var(--ink-mono); letter-spacing: 0.04em;
}
.swd-hero-byline b {
  color: var(--ink); font-weight: 500; font-family: var(--sans);
  letter-spacing: 0.06em; font-size: 12px; display: block; margin-bottom: 4px;
}

.swd-figure { width: var(--col-full); margin: 56px auto 0; position: relative; }
.swd-figure-frame {
  aspect-ratio: 16 / 9; width: 100%;
  background: repeating-linear-gradient(135deg,
    var(--ivory-deep) 0 14px, var(--cream) 14px 15px);
  border: 1px solid var(--cream);
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 26px 28px; position: relative; overflow: hidden;
}
.swd-figure-frame::before {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 22% 38%, rgba(123,155,124,0.22), transparent 55%),
    radial-gradient(ellipse at 78% 62%, rgba(201,169,119,0.18), transparent 60%);
  pointer-events: none;
}
.swd-figure-frame.photo {
  background: var(--ivory-deep); padding: 0;
}
.swd-figure-frame.photo > img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  filter: saturate(0.78) contrast(0.96) sepia(0.05);
}
.swd-figure-frame.photo::before { display: none; }
.swd-photo-veil {
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(180deg, rgba(250,247,242,0.05) 0%, rgba(250,247,242,0.18) 100%),
    radial-gradient(ellipse at 22% 38%, rgba(123,155,124,0.10), transparent 55%),
    radial-gradient(ellipse at 78% 62%, rgba(201,169,119,0.12), transparent 60%);
  mix-blend-mode: multiply;
}
.swd-figure-tag.corner {
  position: absolute; bottom: 18px; left: 18px;
  background: rgba(250,247,242,0.92);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.swd-figure-tag {
  font-family: var(--mono); font-size: 10.5px; color: var(--ink-mono);
  background: var(--ivory); padding: 6px 10px;
  border: 1px solid var(--cream); letter-spacing: 0.06em;
  position: relative; z-index: 1;
}
.swd-figure-caption {
  display: flex; gap: 10px; margin-top: 14px;
  font-family: var(--sans); font-size: 12.5px;
  color: var(--ink-mono); line-height: 1.55;
}
.swd-figure-caption .num {
  font-family: var(--mono); color: var(--gold-deep); letter-spacing: 0.04em;
}
@media (max-width: 720px) {
  .swd-figure { margin-top: 36px; }
  .swd-figure-frame { aspect-ratio: 4 / 5; padding: 18px; }
}

.swd-intro { width: var(--col); margin: 14svh auto 0; }
@media (max-width: 720px) { .swd-intro { margin-top: 8svh; } }
.swd-intro p { margin: 0 0 1.2em; text-wrap: pretty; }
.swd-intro .dropcap::first-letter {
  font-family: var(--serif); font-weight: 500;
  font-size: 4.2em; float: left; line-height: 0.92;
  padding: 0.04em 0.14em 0 0; color: var(--sage-deep);
}
.swd-intro p em.under {
  font-style: italic;
  background-image: linear-gradient(transparent 62%, rgba(201,169,119,0.4) 62%, rgba(201,169,119,0.4) 92%, transparent 92%);
  padding: 0 2px;
}

.swd-section-mark {
  width: var(--col-full); margin: 18svh auto 6svh;
  display: grid; grid-template-columns: 88px 1fr auto;
  align-items: baseline; gap: 28px;
  padding-top: 22px; border-top: 2px solid var(--sage);
}
@media (max-width: 720px) {
  .swd-section-mark {
    margin: 10svh auto 4svh;
    grid-template-columns: 56px 1fr; gap: 14px;
  }
  .swd-section-mark .right { display: none; }
}
.swd-section-mark .roman {
  font-family: var(--serif); font-style: italic;
  color: var(--sage-deep); font-size: 28px; font-weight: 500;
}
.swd-section-mark .label {
  font-family: var(--sans); font-size: 12.5px;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-sub);
}
.swd-section-mark .right {
  font-family: var(--mono); font-size: 11px;
  color: var(--ink-mono); letter-spacing: 0.06em;
}

.swd-statement {
  width: var(--col-full); margin-inline: auto;
  padding: 18svh 0 14svh;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; text-align: center;
}
@media (max-width: 720px) { .swd-statement { padding: 10svh 0 9svh; } }
.swd-statement .big {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(72px, 14vw, 180px);
  letter-spacing: 0.12em; color: var(--sage-deep);
  line-height: 1; display: flex; gap: 0.08em;
}
.swd-statement .big span { display: inline-block; }
.swd-statement .big span.gold { color: var(--gold-deep); }
.swd-statement .sub {
  font-family: var(--sans); font-size: 13.5px;
  letter-spacing: 0.32em; color: var(--ink-sub);
  margin-top: 44px; text-transform: uppercase;
}
.swd-statement .sub::before, .swd-statement .sub::after {
  content: "·"; margin: 0 14px; color: var(--gold);
}

.swd-manifesto { width: var(--col); margin: 0 auto; }
.swd-manifesto h2 {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(36px, 5.5vw, 64px);
  line-height: 1.12; letter-spacing: -0.003em;
  color: var(--ink); margin: 0 0 36px; text-wrap: balance;
}
.swd-manifesto h2 em { font-style: italic; color: var(--sage-deep); }
.swd-manifesto p { margin: 0 0 1.2em; }
.swd-manifesto p em.under {
  font-style: italic;
  background-image: linear-gradient(transparent 62%, rgba(201,169,119,0.4) 62%, rgba(201,169,119,0.4) 92%, transparent 92%);
  padding: 0 2px;
}
.swd-footnote {
  margin-top: 48px; padding: 22px 0 0;
  border-top: 1px solid var(--cream);
  font-family: var(--sans); font-size: 13.5px; color: var(--ink-sub);
  display: grid; grid-template-columns: auto 1fr; gap: 16px;
}
.swd-footnote .num { font-family: var(--mono); color: var(--gold-deep); }

.swd-pullquote {
  width: var(--col-wide); margin: 14svh auto;
  padding: 56px 0; position: relative; text-align: left;
}
.swd-pullquote::before {
  content: ""; position: absolute; top: 0; left: 0;
  width: 64px; height: 2px; background: var(--gold);
}
.swd-pullquote q {
  font-family: var(--serif); font-style: italic; font-weight: 400;
  font-size: clamp(28px, 3.6vw, 44px); line-height: 1.35;
  color: var(--ink); quotes: none; display: block; text-wrap: balance;
}
.swd-pullquote q::before, .swd-pullquote q::after { content: ""; }
.swd-pullquote .attrib {
  margin-top: 32px; font-family: var(--sans);
  font-size: 12.5px; letter-spacing: 0.12em;
  color: var(--ink-sub); text-transform: uppercase;
}

.swd-hooks { width: var(--col-full); margin: 0 auto; }
.swd-hooks .row {
  display: grid; grid-template-columns: 88px 1fr;
  gap: 32px; padding: 44px 0;
  border-top: 1px solid var(--cream); align-items: start;
}
.swd-hooks .row:last-child { border-bottom: 1px solid var(--cream); }
.swd-hooks .row .num {
  font-family: var(--serif); font-style: italic;
  font-size: 44px; font-weight: 500; color: var(--gold);
  line-height: 1; padding-top: 6px;
}
.swd-hooks .row .body { max-width: 720px; }
.swd-hooks .row h3 {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(24px, 3vw, 34px); line-height: 1.25;
  margin: 0 0 14px; color: var(--ink); text-wrap: balance;
}
.swd-hooks .row p {
  margin: 0; font-size: 17.5px; line-height: 1.75; color: var(--ink-sub);
}
.swd-hooks .row:nth-child(2n) {
  grid-template-columns: 1fr 88px; text-align: right;
}
.swd-hooks .row:nth-child(2n) .num { order: 2; padding-top: 6px; }
.swd-hooks .row:nth-child(2n) .body { order: 1; margin-left: auto; }
@media (max-width: 720px) {
  .swd-hooks .row,
  .swd-hooks .row:nth-child(2n) {
    grid-template-columns: 48px 1fr; gap: 16px; padding: 28px 0; text-align: left;
  }
  .swd-hooks .row:nth-child(2n) .num { order: 0; }
  .swd-hooks .row:nth-child(2n) .body { order: 0; margin-left: 0; }
  .swd-hooks .row .num { font-size: 30px; }
}

.swd-scenes { width: var(--col-full); margin: 0 auto; }
.swd-scenes .scene {
  display: grid; grid-template-columns: 140px 1fr 1fr;
  gap: 32px; padding: 36px 0;
  border-top: 1px solid var(--cream); align-items: start;
}
.swd-scenes .scene:last-child { border-bottom: 1px solid var(--cream); }
.swd-scenes .scene .when {
  font-family: var(--mono); font-size: 12px;
  letter-spacing: 0.06em; color: var(--gold-deep);
  display: flex; flex-direction: column; gap: 6px;
}
.swd-scenes .scene .when .time {
  color: var(--ink); font-family: var(--serif);
  font-style: italic; font-size: 22px; font-weight: 500;
}
.swd-scenes .scene h4 {
  font-family: var(--serif); font-weight: 500;
  font-size: 22px; line-height: 1.35;
  margin: 0 0 8px; color: var(--ink); text-wrap: balance;
}
.swd-scenes .scene .detail {
  font-size: 16px; line-height: 1.7; color: var(--ink-sub); margin: 0;
}
.swd-scenes .scene .echo {
  font-family: var(--serif); font-style: italic;
  font-size: 17px; line-height: 1.6; color: var(--sage-deep);
  border-left: 1px solid var(--gold); padding-left: 18px;
}
@media (max-width: 720px) {
  .swd-scenes .scene {
    grid-template-columns: 1fr; gap: 14px; padding: 26px 0;
  }
  .swd-scenes .scene .when {
    flex-direction: row; align-items: baseline; gap: 12px;
  }
  .swd-scenes .scene .when .time { font-size: 18px; }
  .swd-scenes .scene .echo { padding-left: 14px; }
}

.swd-climax {
  width: 100%; margin: 22svh 0 0;
  padding: 14svh 0 12svh;
  background: linear-gradient(180deg, var(--ivory) 0%, var(--ivory-deep) 100%);
  border-top: 2px solid var(--sage);
  border-bottom: 1px solid var(--cream);
  position: relative;
}
@media (max-width: 720px) { .swd-climax { margin-top: 12svh; padding: 9svh 0 8svh; } }
.swd-climax .breakout { width: var(--col-full); margin-inline: auto; }
.swd-climax .breakout .meta {
  display: flex; align-items: center; gap: 16px; margin-bottom: 56px;
}
.swd-climax .breakout .meta .bar {
  width: 56px; height: 2px; background: var(--sage);
}
.swd-climax .breakout h2 {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(64px, 10vw, 144px); line-height: 0.98;
  letter-spacing: -0.005em; margin: 0;
  color: var(--sage-deep); text-wrap: balance;
}
.swd-climax .breakout h2 em {
  font-style: italic; color: var(--gold-deep); font-weight: 500;
}
.swd-climax .breakout .lede {
  margin-top: 48px;
  font-family: var(--serif);
  font-size: clamp(20px, 2.2vw, 26px);
  line-height: 1.6; color: var(--ink); max-width: 32ch;
}
.swd-climax .breakout .lede em.under {
  font-style: italic;
  background-image: linear-gradient(transparent 60%, rgba(201,169,119,0.32) 60%, rgba(201,169,119,0.32) 92%, transparent 92%);
  padding: 0 2px;
}

.swd-timeline { width: var(--col-full); margin: 8svh auto 0; }
.swd-timeline .label {
  display: flex; justify-content: space-between;
  font-family: var(--mono); font-size: 11px;
  color: var(--ink-mono); letter-spacing: 0.08em; margin-bottom: 18px;
}
.swd-timeline .track {
  position: relative; height: 56px; display: flex; align-items: center;
}
.swd-timeline .track::before {
  content: ""; position: absolute; left: 0; right: 0; top: 50%;
  height: 1px; background: var(--cream); transform: translateY(-50%);
}
.swd-timeline .track .lit {
  position: absolute; left: 0; top: 50%;
  height: 1px; background: var(--sage); transform: translateY(-50%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); width: 0;
}
.swd-timeline .dots {
  position: relative; width: 100%;
  display: flex; justify-content: space-between;
}
.swd-timeline .dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--ivory); border: 1px solid var(--cream);
  transition: all 0.5s ease; position: relative;
}
.swd-timeline .dot.on {
  background: var(--sage); border-color: var(--sage);
  box-shadow: 0 0 0 4px rgba(123,155,124,0.14);
}
.swd-timeline .dot.climax {
  width: 18px; height: 18px;
  background: var(--gold); border-color: var(--gold);
}
.swd-timeline .dot.climax.on {
  box-shadow: 0 0 0 6px rgba(201,169,119,0.22);
}
.swd-timeline .cap {
  margin-top: 20px;
  display: flex; justify-content: space-between;
  font-family: var(--sans); font-size: 11.5px;
  letter-spacing: 0.06em; color: var(--ink-mono);
}

.swd-accountable {
  width: var(--col-wide); margin: 14svh auto 8svh; text-align: center;
}
.swd-accountable q {
  font-family: var(--serif); font-style: italic;
  font-size: clamp(28px, 4vw, 48px); font-weight: 400;
  line-height: 1.3; color: var(--ink); quotes: none;
}
.swd-accountable q::before, .swd-accountable q::after { content: ""; }
.swd-accountable .sig {
  margin-top: 36px; font-family: var(--mono);
  font-size: 11.5px; letter-spacing: 0.16em;
  color: var(--sage-deep); text-transform: uppercase;
}

.swd-certificate {
  width: var(--col-wide); margin: 0 auto 14svh;
  padding: 64px 56px;
  background: var(--ivory);
  border: 1px solid var(--gold); position: relative;
}
.swd-certificate::before, .swd-certificate::after {
  content: ""; position: absolute;
  width: 28px; height: 28px; border: 1px solid var(--gold);
}
.swd-certificate::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.swd-certificate::after  { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }
.swd-certificate .stamp {
  font-family: var(--sans); font-size: 11px;
  letter-spacing: 0.32em; text-transform: uppercase;
  color: var(--gold-deep); margin-bottom: 24px;
  display: flex; align-items: center; gap: 12px;
}
.swd-certificate .stamp::before, .swd-certificate .stamp::after {
  content: ""; flex: 1; height: 1px; background: var(--gold); max-width: 80px;
}
.swd-certificate h3 {
  font-family: var(--serif); font-style: italic; font-weight: 500;
  font-size: clamp(28px, 4vw, 42px); line-height: 1.3;
  margin: 0 0 32px; color: var(--ink); text-align: center; text-wrap: balance;
}
.swd-certificate .list {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 28px 48px; margin: 32px 0 0;
}
.swd-certificate .list .item {
  display: grid; grid-template-columns: 24px 1fr;
  gap: 12px; font-size: 17px; line-height: 1.6; color: var(--ink);
}
.swd-certificate .list .item .glyph {
  font-family: var(--serif); font-style: italic;
  color: var(--gold-deep); font-size: 20px; line-height: 1.4;
}
@media (max-width: 720px) {
  .swd-certificate { padding: 38px 24px; }
  .swd-certificate .list { grid-template-columns: 1fr; gap: 22px; }
}

.swd-notall { width: var(--col); margin: 0 auto; text-align: left; }
.swd-notall h3 {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(28px, 3.6vw, 40px); line-height: 1.25;
  margin: 0 0 28px; color: var(--ink); text-wrap: balance;
}
.swd-notall ul {
  list-style: none; margin: 0 0 32px; padding: 0;
  display: flex; flex-direction: column; gap: 12px;
}
.swd-notall ul li {
  font-family: var(--serif); font-style: italic; font-size: 18px;
  color: var(--ink-sub); padding-left: 22px; position: relative;
}
.swd-notall ul li::before {
  content: "—"; position: absolute; left: 0;
  color: var(--gold); font-style: normal;
}

.swd-cta-block {
  width: var(--col-full); margin: 12svh auto 0;
  padding: 12svh 0;
  border-top: 1px solid var(--cream);
  border-bottom: 1px solid var(--cream);
  text-align: center;
}
@media (max-width: 720px) { .swd-cta-block { padding: 8svh 0; margin-top: 8svh; } }
.swd-cta-block .above {
  font-family: var(--sans); font-size: 12.5px;
  letter-spacing: 0.32em; text-transform: uppercase;
  color: var(--gold-deep); margin-bottom: 28px;
}
.swd-cta-block h2 {
  font-family: var(--serif); font-weight: 400; font-style: italic;
  font-size: clamp(28px, 4.6vw, 56px); line-height: 1.2;
  color: var(--ink); margin: 0 auto 56px;
  max-width: 22ch; text-wrap: balance;
}
.swd-cta-btn {
  display: inline-flex; align-items: center; gap: 22px;
  padding: 22px 36px;
  font-family: var(--sans); font-size: 14px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--ivory); background: var(--ink);
  text-decoration: none; border: 1px solid var(--ink);
  transition: all 0.4s cubic-bezier(0.2, 0, 0, 1);
  cursor: pointer;
}
.swd-cta-btn:hover {
  background: var(--sage-deep); border-color: var(--sage-deep);
  letter-spacing: 0.22em; padding-right: 44px;
}
.swd-cta-btn .arrow {
  font-family: var(--serif); font-style: italic;
  transition: transform 0.4s ease;
}
.swd-cta-btn:hover .arrow { transform: translateX(6px); }
.swd-cta-block .cta-sub {
  margin-top: 32px; font-family: var(--mono);
  font-size: 11.5px; color: var(--ink-mono); letter-spacing: 0.06em;
}

.swd-colophon {
  width: var(--col-full); margin: 0 auto;
  padding: 36px 0 56px;
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 24px; flex-wrap: wrap;
  font-family: var(--mono); font-size: 11px;
  color: var(--ink-mono); letter-spacing: 0.06em;
}
.swd-colophon .left, .swd-colophon .right {
  display: flex; gap: 22px; flex-wrap: wrap;
}
.swd-colophon a { color: var(--ink-mono); text-decoration: none; }
.swd-colophon a:hover { color: var(--sage-deep); }
`;
