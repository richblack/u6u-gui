/**
 * TypeScript 型別宣告 — u6u Web Components
 * 讓 React JSX 能直接使用 <u6u-btn>、<u6u-card> 等自訂元素
 */

import type { DOMAttributes } from 'react';
import type React from 'react';

type CustomEventHandler<T = unknown> = (event: CustomEvent<T>) => void;

export interface U6uTriggerDetail {
  workflowId: string;
  payload: Record<string, unknown>;
}

// ── 互動元件 ──────────────────────────────────────────────────────────────────

interface U6uBtnProps extends DOMAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  label?: string;
  color?: string;
  tooltip?: string;
  workflow?: string;
  disabled?: boolean | string;
  'on:u6u:trigger'?: CustomEventHandler<U6uTriggerDetail>;
}

interface U6uTextInputProps extends DOMAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  name?: string;
  placeholder?: string;
  value?: string;
  label?: string;
}

interface U6uTextFieldProps extends DOMAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement & { value?: string }>;
  name?: string;
  placeholder?: string;
  value?: string;
  label?: string;
  rows?: string | number;
}

interface U6uSelectProps extends DOMAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement & { value?: string }>;
  options?: string;
  value?: string;
  placeholder?: string;
  label?: string;
}

// ── 佈局元件 ──────────────────────────────────────────────────────────────────

interface U6uCardProps extends DOMAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  title?: string;
  padding?: string;
  'on:u6u:trigger'?: CustomEventHandler<U6uTriggerDetail>;
}

interface U6uPageProps extends DOMAttributes<HTMLElement> {
  background?: string;
  padding?: string;
}

interface U6uTopbarProps extends DOMAttributes<HTMLElement> {
  bg?: string;
  'border-color'?: string;
  height?: string;
}

interface U6uStackProps extends DOMAttributes<HTMLElement> {
  gap?: string;
  align?: string;
}

interface U6uRowProps extends DOMAttributes<HTMLElement> {
  gap?: string;
  align?: string;
  justify?: string;
}

interface U6uDividerProps extends DOMAttributes<HTMLElement> {
  color?: string;
  spacing?: string;
}

// ── 導覽元件 ──────────────────────────────────────────────────────────────────

interface U6uNavItemProps extends DOMAttributes<HTMLElement> {
  label?: string;
  active?: boolean | string;
  'color-active'?: string;
  'color-inactive'?: string;
  'bg-active'?: string;
}

// ── 資料顯示元件 ──────────────────────────────────────────────────────────────

interface U6uBadgeProps extends DOMAttributes<HTMLElement> {
  label?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'running' | string;
  color?: string;
  bg?: string;
}

interface U6uListItemProps extends DOMAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  'item-id'?: string;
}

// ── 狀態/回饋元件 ─────────────────────────────────────────────────────────────

interface U6uSpinnerProps extends DOMAttributes<HTMLElement> {
  size?: 'sm' | 'md' | 'lg' | string;
  color?: string;
}

interface U6uAlertProps extends DOMAttributes<HTMLElement> {
  variant?: 'error' | 'success' | 'warning' | 'info' | string;
  message?: string;
  dismiss?: boolean | string;
}

interface U6uEmptyStateProps extends DOMAttributes<HTMLElement> {
  icon?: string;
  title?: string;
  description?: string;
}

// ── JSX 元素宣告 ──────────────────────────────────────────────────────────────

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // 互動
      'u6u-btn': U6uBtnProps & React.HTMLAttributes<HTMLElement>;
      'u6u-text-input': U6uTextInputProps & React.HTMLAttributes<HTMLElement>;
      'u6u-text-field': U6uTextFieldProps & React.HTMLAttributes<HTMLElement>;
      'u6u-select': U6uSelectProps & React.HTMLAttributes<HTMLElement>;
      // 佈局
      'u6u-card': U6uCardProps & React.HTMLAttributes<HTMLElement>;
      'u6u-page': U6uPageProps & React.HTMLAttributes<HTMLElement>;
      'u6u-topbar': U6uTopbarProps & React.HTMLAttributes<HTMLElement>;
      'u6u-stack': U6uStackProps & React.HTMLAttributes<HTMLElement>;
      'u6u-row': U6uRowProps & React.HTMLAttributes<HTMLElement>;
      'u6u-divider': U6uDividerProps & React.HTMLAttributes<HTMLElement>;
      // 導覽
      'u6u-nav-item': U6uNavItemProps & React.HTMLAttributes<HTMLElement>;
      // 資料顯示
      'u6u-badge': U6uBadgeProps & React.HTMLAttributes<HTMLElement>;
      'u6u-list-item': U6uListItemProps & React.HTMLAttributes<HTMLElement>;
      'u6u-chart': DOMAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement>;
      // 狀態/回饋
      'u6u-spinner': U6uSpinnerProps & React.HTMLAttributes<HTMLElement>;
      'u6u-alert': U6uAlertProps & React.HTMLAttributes<HTMLElement>;
      'u6u-empty-state': U6uEmptyStateProps & React.HTMLAttributes<HTMLElement>;
    }
  }
}

export type {
  U6uBtnProps, U6uCardProps, U6uTextInputProps, U6uTextFieldProps,
  U6uSelectProps, U6uPageProps, U6uTopbarProps, U6uStackProps, U6uRowProps,
  U6uDividerProps, U6uNavItemProps, U6uBadgeProps, U6uListItemProps,
  U6uSpinnerProps, U6uAlertProps, U6uEmptyStateProps,
};
