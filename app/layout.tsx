import type { Metadata } from 'next';
import { Inter, Lora, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

// 英文 sans (UI 元素 / 按钮 / 表单)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// 英文 serif (Hero / 长 form 阅读)
const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
});

// 中文宋体 (思源宋体 / Noto Serif SC — Google Fonts 名)
const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-source-han-serif',
  preload: false,  // 中文字体大, 不预加载, 用 swap fallback
});

export const metadata: Metadata = {
  title: 'Life OS — 陪你把人生难题想清楚',
  description:
    '重大决定, 别一个人硬扛. Life OS 不替你做决定, 也不用鸡汤安慰你. 它记得你的背景, 陪你一步步拆开真正困住你的问题.',
  openGraph: {
    title: 'Life OS — 陪你把人生难题想清楚',
    description: '重大决定, 别一个人硬扛. 在人生最难选的时候, 有一个长期记得你的人.',
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
      className={`${inter.variable} ${lora.variable} ${notoSerifSC.variable}`}
    >
      <body className="bg-paper text-ink-900 antialiased">{children}</body>
    </html>
  );
}
