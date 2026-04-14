/**
 * usePoll — 通用 polling hook
 *
 * @param fn        要定期執行的 async 函數
 * @param intervalMs 間隔毫秒數
 * @param enabled   false 時停止 polling
 */
import { useEffect } from 'react';

export function usePoll(
  fn: () => void | Promise<void>,
  intervalMs: number,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => { void fn(); }, intervalMs);
    return () => clearInterval(id);
  }, [fn, intervalMs, enabled]);
}
