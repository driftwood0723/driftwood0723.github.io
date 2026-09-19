/** 站点全局配置 —— 改这里就行，其他页面都从这儿读 */
export const site = {
  title: '我的站点',
  // 首页大标题下的一句话
  tagline: '写点东西，顺手做些小工具。',
  author: '你的名字',
  email: '',
  github: '',
  // 部署到 GitHub Pages 时填 'https://<用户名>.github.io'
  url: 'https://example.com',
} as const;

export const nav = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '写作' },
  { href: '/tools', label: '工具' },
] as const;
