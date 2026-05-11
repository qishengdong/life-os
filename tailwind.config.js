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
        // ===== Life OS 严肃出版物色系 (2026-05-11 锁定) =====
        // 灵感: 三联生活周刊 + Lex Magazine + Substack
        paper: {
          DEFAULT: '#FAF7F2',      // 主背景: 暖白
          50:  '#FDFBF7',          // 最亮
          100: '#FAF7F2',          // 主背景
          200: '#F4EFE5',          // 卡片底
          300: '#E8DFD0',          // 边框
          400: '#D4C8B5',          // 分割线深
        },
        ink: {
          DEFAULT: '#3A2E26',       // 主文字: 深棕
          50:  '#F0EDE9',
          100: '#D6CFC6',
          400: '#9D9081',          // 弱文字
          500: '#6B5D52',          // 副文字
          700: '#4A3D33',          // 强调
          900: '#3A2E26',          // 主文字
        },
        // 暗红 accent (像旧书封面 / 印章)
        seal: {
          DEFAULT: '#9B2D27',      // 主 accent
          400: '#C45A53',          // hover
          500: '#9B2D27',          // 主 accent
          600: '#7C231E',          // active
          50:  '#F5E6E5',          // tint bg
        },
        // 次 accent: 哑光金 (用于稀缺场景, 如 Premium / 高净值)
        gilt: {
          DEFAULT: '#9B7E3A',
          400: '#C9A961',
          500: '#9B7E3A',
        },
        // 状态色 (克制)
        sage: '#5C8576',           // success / 稳定
        amber: '#B8843C',          // warning
        ember: '#A8442F',          // danger (跟 seal 拉开)
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
