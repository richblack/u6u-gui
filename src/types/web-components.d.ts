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

interface U6uBtnProps extends DOMAttributes<HTMLElement> {
  label?: string;
  color?: string;
  tooltip?: string;
  workflow?: string;
  disabled?: boolean | string;
  'on:u6u:trigger'?: CustomEventHandler<U6uTriggerDetail>;
}

interface U6uCardProps extends DOMAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  title?: string;
  padding?: string;
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

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'u6u-btn': U6uBtnProps & React.HTMLAttributes<HTMLElement>;
      'u6u-card': U6uCardProps & React.HTMLAttributes<HTMLElement>;
      'u6u-text-input': U6uTextInputProps & React.HTMLAttributes<HTMLElement>;
      'u6u-text-field': U6uTextFieldProps & React.HTMLAttributes<HTMLElement>;
    }
  }
}

export type { U6uBtnProps, U6uCardProps, U6uTextInputProps, U6uTextFieldProps };
