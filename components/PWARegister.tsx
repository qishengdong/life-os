/**
 * PWARegister · 客户端注册 service worker · 5/20 ship
 *
 * 只在 production + HTTPS + 支持 SW 的浏览器才注册.
 * 静默工作, 不打扰用户.
 *
 * 更新策略:
 *   - 检测到新 SW → 自动 skipWaiting → reload 走新版
 *   - 不弹"有新版本"提示 (用户内测期不需要看到 SW 细节)
 */
'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const onLoad = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // 检测到 waiting 的新 SW · 自动跳过等待并 reload
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              installing.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        let reloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        });
      } catch {
        // SW 注册失败不影响产品功能 · 静默
      }
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }
  }, []);

  return null;
}
