/**
 * 用户身份层
 *
 * 客户端: localStorage 存 UUID (life_os_uid)
 * 服务端: 从 X-User-UID header 读 UUID, findOrCreateUserByUid → user_id
 *
 * Sivon doctrine 1.2: 严禁用 birth_date+gender 做用户 ID
 * 严禁任何代码 hardcode user_id (pre-commit hook 守门)
 */

import { NextRequest } from 'next/server';
import { findOrCreateUserByUid } from '@/lib/db';

const UID_HEADER = 'x-user-uid';
const UID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InvalidUserUidError extends Error {
  constructor() {
    super('Missing or invalid X-User-UID header');
    this.name = 'InvalidUserUidError';
  }
}

export function getUserUidFromRequest(req: NextRequest): string {
  const uid = req.headers.get(UID_HEADER);
  if (!uid || !UID_PATTERN.test(uid)) {
    throw new InvalidUserUidError();
  }
  return uid.toLowerCase();
}

export async function resolveUserId(req: NextRequest): Promise<{ userId: number; userUid: string }> {
  const userUid = getUserUidFromRequest(req);
  const userId = await findOrCreateUserByUid(userUid);
  return { userId, userUid };
}

export const UID_HEADER_NAME = 'X-User-UID';
