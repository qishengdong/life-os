/**
 * InstallButton · Android Chrome 真主动安装触发 · 5/20 ship
 *
 * 工作机制:
 *   1. Chrome 触发 `beforeinstallprompt` 事件 (满足 install criteria 后)
 *   2. 我们 preventDefault() 阻止 Chrome 默认 mini-bar, 保存 event
 *   3. 用户点我们的"安装"按钮 → 调用 event.prompt() → 弹真原生 install dialog
 *   4. 100% 触发, 不依赖用户找 Chrome 菜单
 *
 * iOS 没这个 API, 走 Safari 分享菜单手动加 (在 /welcome 已有指南).
 *
 * 已经 standalone 模式打开 (从主屏图标进) → 隐藏按钮.
 */
'use client';

import { useEffect, useState } from 'react';

// Chrome 私有事件类型 (TypeScript 没原生声明)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export default function InstallButton({
  variant = 'primary',
}: {
  variant?: 'primary' | 'inline';
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 检测当前是否已经在 standalone (从主屏图标启动)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // 已 standalone 模式 (主屏点进来的) → 不显示
  if (isStandalone) return null;

  // 已安装 → 显示已安装状态
  if (installed) {
    return (
      <p className="font-serif italic text-[14px] text-seal-500">
        ✓ KEY 已安装到你的设备. 上滑屏幕进应用抽屉找 KEY 图标, 长按拖到桌面.
      </p>
    );
  }

  // beforeinstallprompt 还没触发 (Chrome 未满足条件 / 已经安装过 / 非 Chrome 内核)
  if (!deferred) {
    return (
      <div className="space-y-2">
        <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
          {status || '没看到一键安装? 按下面 3 步手动添加, 同样有效.'}
        </p>
      </div>
    );
  }

  async function handleInstall() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') {
        setStatus('✓ 已安装. 上滑屏幕进应用抽屉找 KEY 图标, 长按拖到桌面.');
        setInstalled(true);
      } else {
        setStatus('取消了. 改主意按下面 3 步手动添加也行.');
      }
      setDeferred(null);
    } catch (e: any) {
      setStatus('安装失败: ' + (e?.message || '未知错误'));
    }
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center gap-2 px-5 py-2.5 font-serif text-[14px] text-paper bg-seal-500 hover:bg-seal-700 transition-colors"
      >
        一键安装到桌面 →
      </button>
    );
  }

  return (
    <div className="border border-seal-500/40 bg-paper-50 p-5 rounded-sm">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
        · 一键安装 ·
      </p>
      <p className="font-serif text-[14px] text-ink-700 leading-relaxed mb-4">
        你的浏览器支持一键安装 KEY 到设备. 不用翻菜单, 不用 3 步.
      </p>
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center gap-2 px-6 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
      >
        一键安装到桌面 →
      </button>
      {status && (
        <p className="mt-4 font-serif italic text-[13px] text-seal-500">{status}</p>
      )}
    </div>
  );
}
