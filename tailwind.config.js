/**
 * Tailwind config · KEY V1 (Phase 1)
 *
 * Source of truth: design-handoff/DELIVERABLES/02-color-palette/palette.json
 *                  design-handoff/DELIVERABLES/03-typography/typography-css-tokens.css
 *
 * Body line-height = 1.75 (per Brand Brief; rejected designer's 1.78 in feedback 03).
 * Fonts = Plan A (Source Serif 4 + Inter + Noto Serif SC + Noto Sans SC + JetBrains Mono).
 */

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
        // ============================================================
        // KEY · Core 5 (locked per Brand Brief v1 §12)
        // ============================================================

        paper: {
          DEFAULT: '#F7F3EA',
          100: '#FBF8F1',          // elevated surface
          200: '#F7F3EA',          // KEY core background
          300: '#EFEAE0',          // sunken / cards
          400: '#E2DCD0',          // borders
          500: '#D6CFC2',          // deep dividers
        },

        ink: {
          DEFAULT: '#111111',
          900: '#111111',          // KEY core
          700: '#2A2622',          // emphasis
          500: '#5A554F',          // secondary text
          400: '#7A7570',          // tertiary text
          300: '#9F9B95',          // muted
          200: '#C2BFB8',          // very muted
        },

        burgundy: {
          DEFAULT: '#6E1F2A',
          700: '#561822',          // pressed
          500: '#6E1F2A',          // KEY core
          400: '#8A2F3B',          // hover / stamp on dark
          300: '#B05863',          // muted accent (V2 will document use)
          50:  '#F5E8E9',          // tint bg (callout only, never page bg)
        },

        warmGray: {
          DEFAULT: '#BDB6AA',
          300: '#BDB6AA',          // KEY core (hairlines, decorative captions ONLY)
          // Not body type. WCAG on paper = 1.9. See palette.json wcag table.
        },

        navy: {
          DEFAULT: '#141923',
          900: '#0C1018',          // deepest
          700: '#141923',          // KEY core
          500: '#1F2632',          // elevated dark surface
          300: '#3A4250',          // muted on dark
        },

        // ============================================================
        // Status colors (added to V1 per feedback 02 — rejected designer's
        // "wait for flow demands". Outcome / Email / Validation already use them.)
        // ============================================================
        sage:  '#5C8576',          // success / 应验信号
        amber: '#B8843C',          // warning / validation issue
        ember: '#A8442F',          // danger / 塌方信号

        // ============================================================
        // Legacy aliases (向后兼容, v3.5 移除)
        // Old code uses 'seal' for accent red → redirect to burgundy
        // ============================================================
        seal: {
          DEFAULT: '#6E1F2A',
          400: '#8A2F3B',
          500: '#6E1F2A',
          600: '#561822',
          50:  '#F5E8E9',
        },
        gilt: {
          DEFAULT: '#9B7E3A',
          400: '#C9A961',
          500: '#9B7E3A',
        },
      },

      fontFamily: {
        // Plan A · Source Serif 4 → primary editorial serif
        serif: [
          'var(--font-source-serif)',
          'var(--font-noto-serif-sc)',
          'Georgia',
          'serif',
        ],
        // Inter for UI / labels / nav
        sans: [
          'var(--font-inter)',
          'var(--font-noto-sans-sc)',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        // JetBrains Mono for IDs / brief number / timestamps
        mono: [
          'var(--font-jetbrains-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },

      fontSize: {
        // ============================================================
        // KEY type scale (per typography-css-tokens.css V1, body lh = 1.75)
        // ============================================================
        'display-1':    ['96px', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-2':    ['72px', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'editorial-xl': ['3.5rem', { lineHeight: '1.10', letterSpacing: '-0.01em' }],  // hero, 56px
        'editorial-lg': ['2.5rem', { lineHeight: '1.18', letterSpacing: '-0.005em' }], // h1, 40px
        'editorial':    ['1.75rem', { lineHeight: '1.30' }],                            // h2, 28px
        'editorial-sm': ['1.375rem', { lineHeight: '1.35' }],                           // h3, 22px
        'quote':        ['1.5rem', { lineHeight: '1.50' }],                             // 24px italic
        'reading':      ['1.0625rem', { lineHeight: '1.75' }],                          // body, 17px / 1.75 (per Brand Brief, designer pushed back to this in V2)
        'reading-large': ['1.1875rem', { lineHeight: '1.80' }],                         // KEY Letter / methodology long-form, 19px (V2 add)
        'reading-small': ['0.9375rem', { lineHeight: '1.72' }],                         // 15px
        'caption':      ['0.8125rem', { lineHeight: '1.60' }],                          // 13px
        'label':        ['0.65625rem', { lineHeight: '1.40', letterSpacing: '0.32em' }], // 10.5px uppercase
      },

      letterSpacing: {
        tightish: '-0.005em',
        tighter: '-0.01em',
        tightest: '-0.02em',
        wordmark: '0.16em',   // KEY wordmark (Direction A)
      },

      maxWidth: {
        'prose-lg': '38rem',
        'prose-xl': '44rem',
        'measure-en': '66ch',
        'measure-cn': '32em',
      },

      typography: ({ theme }) => ({
        editorial: {
          css: {
            '--tw-prose-body': theme('colors.ink.700'),
            '--tw-prose-headings': theme('colors.ink.900'),
            '--tw-prose-lead': theme('colors.ink.500'),
            '--tw-prose-links': theme('colors.burgundy.500'),
            '--tw-prose-bold': theme('colors.ink.900'),
            '--tw-prose-counters': theme('colors.ink.400'),
            '--tw-prose-bullets': theme('colors.ink.300'),
            '--tw-prose-hr': theme('colors.paper.300'),
            '--tw-prose-quotes': theme('colors.ink.700'),
            '--tw-prose-quote-borders': theme('colors.burgundy.500'),
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
