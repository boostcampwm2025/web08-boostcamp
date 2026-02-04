import type { Permission } from './constants.js';

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 * @param userPerms 사용자의 권한 비트
 * @param required 필요한 권한
 * @returns 권한 보유 여부
 */
export function has(userPerms: number, required: Permission): boolean {
  return (userPerms & required) === required;
}

/**
 * 사용자가 후보 권한 중 하나라도 가지고 있는지 확인
 * @param userPerms 사용자의 권한 비트
 * @param candidates 후보 권한들
 * @returns 하나라도 보유하면 true
 */
export function hasAny(userPerms: number, candidates: Permission[]): boolean {
  return candidates.some((perm) => has(userPerms, perm));
}

/**
 * 사용자가 모든 권한을 가지고 있는지 확인
 * @param userPerms 사용자의 권한 비트
 * @param required 필요한 권한들
 * @returns 모두 보유하면 true
 */
export function hasAll(userPerms: number, required: Permission[]): boolean {
  return required.every((perm) => has(userPerms, perm));
}

/**
 * 권한 추가
 * @param userPerms 현재 권한
 * @param permission 추가할 권한
 * @returns 새로운 권한 값
 */
export function add(userPerms: number, permission: Permission): number {
  return userPerms | permission;
}

/**
 * 권한 제거
 * @param userPerms 현재 권한
 * @param permission 제거할 권한
 * @returns 새로운 권한 값
 */
export function remove(userPerms: number, permission: Permission): number {
  return userPerms & ~permission;
}

/**
 * 권한 토글
 * @param userPerms 현재 권한
 * @param permission 토글할 권한
 * @returns 새로운 권한 값
 */
export function toggle(userPerms: number, permission: Permission): number {
  return userPerms ^ permission;
}
