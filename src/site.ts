/** 站点全局配置 —— 改这里就行，其他页面都从这儿读 */
export const site = {
  title: '浮木',
  // 首页大标题下的一句话
  tagline: '写点东西，顺手做些小工具。',
  author: '浮木',
  email: '',
  github: 'driftwood0723',
  url: 'https://driftwood0723.github.io',
} as const;

export const nav = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '写作' },
  { href: '/tools', label: '工具' },
] as const;
