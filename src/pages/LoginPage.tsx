/**
 * LoginPage — API-Key 登入頁面
 *
 * 用戶輸入 API-Key，呼叫 /auth/verify 驗證，
 * 成功後呼叫 onLogin(key, orgNamespace) 進入主畫面。
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { verifyApiKey } from '../api';

// 動態載入 Web Components
if (typeof window !== 'undefined') {
  void import(/* @vite-ignore */ '@u6u-wc/u6u-card').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-btn').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-text-input').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-spinner').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-alert').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-stack').catch(() => {});
}

interface LoginPageProps {
  onLogin: (apiKey: string, orgNamespace: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLElement & { value?: string }>(null);
  const btnRef = useRef<HTMLElement>(null);

  const handleSubmit = useCallback(async () => {
    const key = inputRef.current?.value?.trim() ?? '';
    if (!key) {
      setError('請輸入 API Key');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await verifyApiKey(key);
      if (result.valid && result.org_namespace) {
        onLogin(key, result.org_namespace);
      } else {
        setError('API Key 無效或已過期，請確認後重試');
      }
    } catch {
      setError('無法連線至伺服器，請檢查網路後重試');
    } finally {
      setLoading(false);
    }
  }, [onLogin]);

  // 監聽按鈕點擊
  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const handler = () => { void handleSubmit(); };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [handleSubmit]);

  // 監聽 Enter 鍵
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') void handleSubmit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSubmit]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0f0f0f' }}
    >
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold tracking-tight" style={{ color: '#a78bfa' }}>
            u6u
          </span>
          <p className="text-sm mt-2" style={{ color: '#52525b' }}>
            AI-first Workflow Platform
          </p>
        </div>

        {/* 登入卡片 */}
        <u6u-card title="登入" padding="24px">
          <u6u-stack gap="16px">
            <u6u-text-input
              ref={inputRef}
              name="apikey"
              label="API Key"
              placeholder="輸入您的 Bearer token..."
            />

            {error && (
              <u6u-alert variant="error" message={error} />
            )}

            {loading ? (
              <div className="flex justify-center py-2">
                <u6u-spinner size="md" color="#8b5cf6" />
              </div>
            ) : (
              <u6u-btn
                ref={btnRef}
                label="驗證登入"
                color="#8b5cf6"
              />
            )}
          </u6u-stack>
        </u6u-card>

        <p className="text-center text-xs mt-4" style={{ color: '#3f3f46' }}>
          API Key 來源：u6u 管理員後台 → Partners
        </p>
      </div>
    </div>
  );
}
