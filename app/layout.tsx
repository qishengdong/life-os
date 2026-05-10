import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Life OS — 反鸡汤决策伙伴',
  description: '帮你想透重大人生决策。不给答案，给结构。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
