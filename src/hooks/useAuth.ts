/**
 * useAuth — API-Key 認證狀態管理
 *
 * API-Key 存於 sessionStorage（Tab 關閉即失效，不存 localStorage）。
 */

const KEY_API_KEY = 'u6u_api_key';
const KEY_ORG_NS = 'u6u_org_ns';

export function getApiKey(): string | null {
  return sessionStorage.getItem(KEY_API_KEY);
}

export function getOrgNamespace(): string | null {
  return sessionStorage.getItem(KEY_ORG_NS);
}

export function setAuth(apiKey: string, orgNamespace: string): void {
  sessionStorage.setItem(KEY_API_KEY, apiKey);
  sessionStorage.setItem(KEY_ORG_NS, orgNamespace);
}

export function clearAuth(): void {
  sessionStorage.removeItem(KEY_API_KEY);
  sessionStorage.removeItem(KEY_ORG_NS);
}

export function isAuthenticated(): boolean {
  return !!getApiKey() && !!getOrgNamespace();
}
