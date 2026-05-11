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
  title: 'Life OS — 不安慰你, 只陪你看清结构',
  description:
    'Life OS 是中国高知用户的日常思考伴侣 + 人生重大决策系统. 它记得你的背景, 用决策科学陪你把问题想透.',
  // Open Graph 简版
  openGraph: {
    title: 'Life OS',
    description: '不安慰你, 不命令你, 不替你决定, 只陪你看清结构.',
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
