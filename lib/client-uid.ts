/**
 * 客户端用户 UID 管理 (localStorage)
 *
 * 第一次访问生成 UUID, 之后所有请求带 X-User-UID header.
 *
 * V1+ 升级路径:
 *   - 邮箱注册后, 把 UUID 跟 email 绑定
 *   - 多设备登录: 服务端给同 email 的设备返回相同 UUID
 *   - 设备迁移: "导入身份" 功能输入旧 UUID
 */

const STORAGE_KEY = 'life_os_uid';

export function getOrCreateClientUid(): string {
  if (typeof window === 'undefined') {
    throw new Error('getOrCreateClientUid 只能在浏览器中调用');
  }
  let uid = localStorage.getItem(STORAGE_KEY);
  if (!uid || !isValidUuid(uid)) {
    uid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, uid);
  }
  return uid;
}

export function getClientUid(): string | null {
  if (typeof window === 'undefined') return null;
  const uid = localStorage.getItem(STORAGE_KEY);
  return uid && isValidUuid(uid) ? uid : null;
}

export function resetClientUid(): string {
  if (typeof window === 'undefined') {
    throw new Error('resetClientUid 只能在浏览器中调用');
  }
  const newUid = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, newUid);
  return newUid;
}

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export const UID_HEADER = 'X-User-UID';
