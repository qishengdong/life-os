/**
 * 写信起点 — "批改模板" (C+ 设计)
 *
 * 用户洞察: 中国人最舒服的不是"从零创作", 是"在既定答案上批改".
 * 既避免"不会写"的尴尬, 又给予权力感.
 *
 * 这些起点用户进 /letters/new 时可选其一 → 内容预填进信纸 → 用户改.
 *
 * 选材原则:
 *   - 直击中国 30-55 岁高净值用户 (含女性) 真的会卡在喉咙里的话
 *   - 不是 prompt 句, 是 "起兴" — 提供一个钩, 让用户从那里继续
 *   - 性别比例: 女性向 / 男性向 / 中性 各 ~ 3
 *   - 主题: 家庭 / 工作 / 自我 / 关系 / 比较 / 童年 / 失语 / 微观情绪
 *
 * 用户拍板这一版用作 V1, 未来根据反馈优化.
 */

export interface LetterStarter {
  id: string;            // 用于 React key
  text: string;          // 填进信纸的起点文字 (用户在此上修改)
  hint?: string;         // 极小灰字辅助说明 (可选, 选起点时显示)
}

export const LETTER_STARTERS: LetterStarter[] = [
  {
    id: 'parents-call',
    text: '我跟我父母, 这周通了两次电话, 但 ',
    hint: '一段亲缘里没说完的话',
  },
  {
    id: 'spouse-asked',
    text: '我老婆 (老公) 最近问我 ',
    hint: '那个被问到时心里咯噔的瞬间',
  },
  {
    id: 'looking-at-child',
    text: '我看着我孩子, 心里突然 ',
    hint: '一段不能跟孩子说出口的心事',
  },
  {
    id: 'after-deal',
    text: '那个 deal 谈完之后, 我 ',
    hint: '完成之后那种奇怪的空',
  },
  {
    id: 'classmate-circle',
    text: '我看到老同学发的朋友圈, ',
    hint: '比较带来的那一下不舒服',
  },
  {
    id: 'parent-said',
    text: '我父亲 (母亲) 跟我说过一句话, 这么多年我 ',
    hint: '一句早年的话, 它在你身上留下的印',
  },
  {
    id: 'pretended-fine',
    text: '我假装没事很多年了, 但 ',
    hint: '那个一直藏着的, 现在想说',
  },
  {
    id: 'small-thing',
    text: '今天发生了一件小事, 但我 ',
    hint: '小事是真心话的入口',
  },
];

export const BLANK_STARTER_ID = '__blank__';
