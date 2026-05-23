/**
 * KEY · Service Worker · 5/20 ship
 *
 * 策略 (narrow · 不缓存用户数据 · 只缓存 app shell):
 *   - 静态资源 (icons / manifest / fonts): cache-first
 *   - 公开页 HTML (/, /how-it-works, /welcome, /sample-brief): stale-while-revalidate
 *   - API 请求 (/api/*): **永不缓存** (用户数据必须实时, 不能离线读)
 *   - 受保护页 (/home /pulse /decisions /brain /your-pattern): network-first (有网用网, 没网兜底 offline 页)
 *
 * 关键设计原则:
 *   1. 用户档案永不缓存 - 隐私 + 一致性优先于离线
 *   2. SW 版本号变更 = 旧 cache 清空 + 强制更新 (避免用户卡老版)
 *   3. 弱网/无网时, 静态页 + offline fallback, 不假装能用
 */

const SW_VERSION = 'v5-2026-05-22-3layer-asset';
const SHELL_CACHE = `key-shell-${SW_VERSION}`;
const STATIC_CACHE = `key-static-${SW_VERSION}`;

// App shell · 公开页 + 静态资源, install 时预缓存
const SHELL_URLS = [
  '/',
  '/how-it-works',
  '/why-key',         // 5/20 ship · 战略叙事核心
  '/manifesto',       // 5/20 ship · 创始人宣言
  '/offline',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

// install · 预缓存 shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // shell 失败不阻塞 install (单个 URL 404 不应该让 SW 整个挂)
      return Promise.all(
        SHELL_URLS.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then((resp) => resp.ok && cache.put(url, resp))
            .catch(() => null),
        ),
      );
    }).then(() => self.skipWaiting()),
  );
});

// activate · 清旧 cache + 接管页面
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

// fetch · 按路由分发策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // POST/PUT/DELETE 全部走网络

  const url = new URL(request.url);

  // 跨域请求 · 走网络, 不拦
  if (url.origin !== self.location.origin) return;

  // /api/* · 永不缓存 (用户数据)
  if (url.pathname.startsWith('/api/')) return;

  // 静态资源 (.svg .png .jpg .webp .ico .woff .woff2 .css .js)
  if (/\.(svg|png|jpg|jpeg|webp|ico|woff2?|css|js|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML 页面 · network-first + offline fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }
});

// cache-first · 静态资源 (字体 / 图标 / 不变的 chunk)
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const resp = await fetch(request);
    if (resp.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, resp.clone()).catch(() => null);
    }
    return resp;
  } catch (e) {
    return new Response('', { status: 503, statusText: 'offline' });
  }
}

// network-first · HTML 页 (新鲜优先, 离线兜底)
async function networkFirst(request, cacheName) {
  try {
    const resp = await fetch(request);
    if (resp.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, resp.clone()).catch(() => null);
    }
    return resp;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // 都没了 · 走 offline 页
    const offlinePage = await caches.match('/offline');
    if (offlinePage) return offlinePage;
    return new Response('离线 · 暂时打不开. 网恢复了再试.', {
      status: 503,
      statusText: 'offline',
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}

// 监听 SKIP_WAITING 消息 (前端控制更新时机)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
