/** 大数按「万 / 亿」显示，符合游戏内阅读习惯 */
export function formatBig(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 100_000_000) return `${(value / 100_000_000).toFixed(2)} 亿`;
  if (abs >= 10_000) return `${(value / 10_000).toFixed(2)} 万`;
  return value.toLocaleString('zh-CN');
}

export function formatCount(value: number): string {
  return value.toLocaleString('zh-CN');
}
