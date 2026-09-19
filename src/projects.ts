/** 作品列表 —— 按需增删，描述记得改成你自己的话 */
export interface Project {
  name: string;
  description: string;
  tags: string[];
  href?: string;   // 仓库或线上地址，留空则不可点击
  year?: string;
}

export const projects: Project[] = [
  {
    name: 'mhxy-tools',
    description: '待补充：这个项目解决了什么问题？',
    tags: ['TypeScript', 'Turborepo', 'monorepo'],
    year: '2026',
  },
  {
    name: 'qa-miniprogram',
    description: '待补充：小程序做什么用的？',
    tags: ['小程序', 'pnpm workspace'],
    year: '2026',
  },
  {
    name: 'crawler',
    description: '待补充：爬什么数据，怎么用的？',
    tags: ['Node.js', '爬虫'],
    year: '2026',
  },
];
