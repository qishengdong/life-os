/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ===== KEY 视觉系统 (2026-05-13 锁定, 替换 LifeOS v2) =====
        // Source: KEY Brand Brief v1 第 12 节 + docs/BRAND_BRIEF_V3_KEY.md
        // 5 core 色 + 派生 scale + 状态色

        // Paper — 主背景, 大面积底色 (从 LifeOS 暖白 #FAF7F2 → KEY paper #F7F3EA, 略冷)
        paper: {
          DEFAULT: '#F7F3EA',      // KEY core
          50:  '#FAF8F2',          // 最亮 (卡片层次)
          100: '#F7F3EA',          // KEY core (背景默认)
          200: '#EFEAE0',          // 卡片底
          300: '#E2DCD0',          // 边框
          400: '#D6CFC2',          // 分割线深
        },

        // Ink — 主文字 (从 LifeOS 深棕 #3A2E26 → KEY ink #111111 真黑, 增加重量感)
        ink: {
          DEFAULT: '#111111',       // KEY core
          50:  '#F0EDE9',
          100: '#D6CFC6',
          300: '#9F9B95',          // 微弱
          400: '#7A7570',          // 弱文字
          500: '#5A554F',          // 副文字
          700: '#2A2622',          // 强调
          900: '#111111',          // KEY core (主文字默认)
        },

        // Burgundy — 关键标记 / 印章 (从 LifeOS seal #9B2D27 → KEY burgundy #6E1F2A, 深 30%, 更书本感)
        burgundy: {
          DEFAULT: '#6E1F2A',      // KEY core
          400: '#8A2F3B',          // hover
          500: '#6E1F2A',          // KEY core
          600: '#561822',          // active
          50:  '#F5E8E9',          // tint bg
        },

        // Warm Gray — 次文字 / 边框 (KEY 新加色, LifeOS 没有专门的中性灰)
        warmGray: {
          DEFAULT: '#BDB6AA',      // KEY core
          50:  '#F0EDE6',
          100: '#E8E2D7',
          200: '#D5CEC0',
          300: '#BDB6AA',          // KEY core
          400: '#9F9889',
          500: '#807A6E',
        },

        // Night Navy — 深色 cover / Admin / Premium 印刷 (KEY 新加, 仅用于深色场景)
        navy: {
          DEFAULT: '#141923',      // KEY core
          400: '#2A3142',
          500: '#141923',          // KEY core
          600: '#0A0D14',
        },

        // ===== Legacy aliases (向后兼容, v3.5 移除) =====
        // 旧代码用 seal 引用红色, 重定向到 burgundy
        seal: {
          DEFAULT: '#6E1F2A',      // 别名 → burgundy
          400: '#8A2F3B',
          500: '#6E1F2A',
          600: '#561822',
          50:  '#F5E8E9',
        },
        // 次 accent: 哑光金 (保留, V2 Premium 场景可能用)
        gilt: {
          DEFAULT: '#9B7E3A',
          400: '#C9A961',
          500: '#9B7E3A',
        },

        // ===== 状态色 (跟 v2 一致, 不变) =====
        sage: '#5C8576',           // success / 稳定
        amber: '#B8843C',          // warning
        ember: '#A8442F',          // danger (跟 burgundy 拉开)
      },
      fontFamily: {
        // ===== 字体系统 =====
        // 中文/英文 serif: 阅读杂志感 (用于 Hero / 决策报告 / Brain 长 form)
        serif: ['var(--font-source-han-serif)', 'var(--font-lora)', 'serif'],
        // sans: UI 元素 / 按钮 / 表单 (用 Inter)
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // mono: 数字 / 代码 / 时间戳
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // 编辑部式 type scale (relaxed leading)
        'editorial-xl': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'editorial-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'editorial': ['1.875rem', { lineHeight: '1.35' }],
        'reading': ['1.0625rem', { lineHeight: '1.7' }],  // 主阅读体
      },
      letterSpacing: {
        tightish: '-0.01em',
        tighter: '-0.02em',
      },
      maxWidth: {
        'prose-lg': '38rem',       // editorial column
        'prose-xl': '44rem',
      },
      typography: ({ theme }) => ({
        editorial: {
          css: {
            '--tw-prose-body': theme('colors.ink.700'),
            '--tw-prose-headings': theme('colors.ink.900'),
            '--tw-prose-lead': theme('colors.ink.500'),
            '--tw-prose-links': theme('colors.seal.500'),
            '--tw-prose-bold': theme('colors.ink.900'),
            '--tw-prose-counters': theme('colors.ink.400'),
            '--tw-prose-bullets': theme('colors.ink.300'),
            '--tw-prose-hr': theme('colors.paper.300'),
            '--tw-prose-quotes': theme('colors.ink.700'),
            '--tw-prose-quote-borders': theme('colors.seal.500'),
            '--tw-prose-captions': theme('colors.ink.400'),
            '--tw-prose-code': theme('colors.ink.900'),
            '--tw-prose-pre-code': theme('colors.paper.100'),
            '--tw-prose-pre-bg': theme('colors.ink.900'),
            '--tw-prose-th-borders': theme('colors.paper.300'),
            '--tw-prose-td-borders': theme('colors.paper.300'),
            fontFamily: theme('fontFamily.serif').join(', '),
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            h1: { fontFamily: theme('fontFamily.serif').join(', '), letterSpacing: '-0.02em', fontWeight: '700' },
            h2: { fontFamily: theme('fontFamily.serif').join(', '), letterSpacing: '-0.01em', fontWeight: '600' },
            h3: { fontFamily: theme('fontFamily.serif').join(', '), fontWeight: '600' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
