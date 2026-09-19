/** 工具列表 —— 新增工具时在这里加一条，并在 src/pages/tools/ 下建对应页面 */
export interface Tool {
  name: string;
  description: string;
  href: string;
}

export const tools: Tool[] = [
  {
    name: '时间戳转换',
    description: 'Unix 时间戳和日期互转，秒/毫秒自动识别。',
    href: '/tools/timestamp/',
  },
];
