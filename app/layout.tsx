import type { Metadata } from 'next';
import { Inter, Source_Serif_4, Noto_Serif_SC, Noto_Sans_SC, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// English sans (UI / nav / labels) — Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// English serif (Hero / brief / long-form reading) — Source Serif 4 (Plan A)
// Variable font: opsz 8-60, weight 200-900, ital + roman
const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-source-serif',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

// 中文宋体 — Noto Serif SC (思源宋体 SC)
const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--font-noto-serif-sc',
  preload: false, // 中文字体大, 用 swap fallback
});

// 中文黑体 — Noto Sans SC (思源黑体 SC) for small labels in CN
const notoSansSC = Noto_Sans_SC({
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  preload: false,
});

// Mono for brief number / IDs / timestamps — JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'KEY · Find the key before you decide.',
  description:
    '决定之前, 先找到关键. KEY 是一项 AI 原生人生决策顾问服务. 它记得你的真实背景, 把复杂选择整理成一份可阅读、可行动、可复盘的私人决策简报.',
  openGraph: {
    title: 'KEY · Find the key before you decide.',
    description: '决定之前, 先找到关键. AI 原生人生决策顾问, 以私人简报交付.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${sourceSerif.variable} ${notoSerifSC.variable} ${notoSansSC.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-paper text-ink-900 antialiased">{children}</body>
    </html>
  );
}
