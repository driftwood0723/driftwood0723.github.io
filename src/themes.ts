/** 候选配色（浅色系）—— 选定后把对应 vars 写进 global.css 的 :root，再删掉切换器 */
export interface Theme {
  id: string;
  name: string;
  desc: string;
  swatch: [string, string, string];
  vars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    id: 'indigo',
    name: '靛紫（当前）',
    desc: '紫蓝调，科技感，晕染偏冷',
    swatch: ['#6d4aff', '#0b7fd4', '#c0389a'],
    vars: {
      '--bg': '#fcfcfb', '--bg-soft': '#f5f5f3',
      '--text': '#1a1a20', '--text-muted': '#56565f', '--text-dim': '#8e8e98',
      '--accent': '#6d4aff', '--accent-2': '#0b7fd4', '--accent-3': '#c0389a',
      '--glow-1': '#a78bfa', '--glow-2': '#60a5fa', '--glow-3': '#f0abfc',
      '--glow-1-o': '.3', '--glow-2-o': '.26', '--glow-3-o': '.2',
      '--grad': 'linear-gradient(110deg, #6d4aff 0%, #4361ee 32%, #0b7fd4 62%, #c0389a 100%)',
    },
  },
  {
    id: 'paper',
    name: '纸白',
    desc: '几乎无彩，暖白纸感，内容说话。最耐看',
    swatch: ['#3f3f46', '#71717a', '#a1a1aa'],
    vars: {
      '--bg': '#fdfcfa', '--bg-soft': '#f4f2ee',
      '--text': '#1c1b19', '--text-muted': '#57544e', '--text-dim': '#918d85',
      '--accent': '#3f3d39', '--accent-2': '#6b675f', '--accent-3': '#8a857b',
      '--glow-1': '#e7e2d8', '--glow-2': '#dcd8ce', '--glow-3': '#efe9dd',
      '--glow-1-o': '.75', '--glow-2-o': '.6', '--glow-3-o': '.5',
      '--grad': 'linear-gradient(110deg, #2b2a27 0%, #504c45 45%, #6b675f 100%)',
    },
  },
  {
    id: 'ocean',
    name: '海蓝',
    desc: '克制的蓝，最像正经技术站，久看不累',
    swatch: ['#0369a1', '#0891b2', '#2563eb'],
    vars: {
      '--bg': '#fbfcfd', '--bg-soft': '#f1f5f8',
      '--text': '#111827', '--text-muted': '#4b5563', '--text-dim': '#8b96a5',
      '--accent': '#0369a1', '--accent-2': '#0891b2', '--accent-3': '#2563eb',
      '--glow-1': '#7dd3fc', '--glow-2': '#a5b4fc', '--glow-3': '#67e8f9',
      '--glow-1-o': '.3', '--glow-2-o': '.24', '--glow-3-o': '.2',
      '--grad': 'linear-gradient(110deg, #0369a1 0%, #0284c7 35%, #0891b2 70%, #2563eb 100%)',
    },
  },
  {
    id: 'moss',
    name: '苔绿',
    desc: '低饱和绿，安静、有生机，不像终端那么硬',
    swatch: ['#047857', '#0d9488', '#4d7c0f'],
    vars: {
      '--bg': '#fcfdfb', '--bg-soft': '#f1f6f1',
      '--text': '#14201a', '--text-muted': '#4a5b52', '--text-dim': '#8a9a90',
      '--accent': '#047857', '--accent-2': '#0d9488', '--accent-3': '#4d7c0f',
      '--glow-1': '#a7f3d0', '--glow-2': '#bbf7d0', '--glow-3': '#d9f99d',
      '--glow-1-o': '.45', '--glow-2-o': '.38', '--glow-3-o': '.3',
      '--grad': 'linear-gradient(110deg, #065f46 0%, #047857 35%, #0d9488 70%, #4d7c0f 100%)',
    },
  },
  {
    id: 'clay',
    name: '陶土',
    desc: '砖橙赭石，暖、有手感，跟大多数冷色站不一样',
    swatch: ['#b4522e', '#c2410c', '#a16207'],
    vars: {
      '--bg': '#fdfbf8', '--bg-soft': '#f7f1e9',
      '--text': '#221a14', '--text-muted': '#5e5045', '--text-dim': '#9b8b7c',
      '--accent': '#b4522e', '--accent-2': '#c2410c', '--accent-3': '#a16207',
      '--glow-1': '#fed7aa', '--glow-2': '#fecaca', '--glow-3': '#fde68a',
      '--glow-1-o': '.5', '--glow-2-o': '.38', '--glow-3-o': '.35',
      '--grad': 'linear-gradient(110deg, #9a3412 0%, #b4522e 35%, #c2410c 68%, #a16207 100%)',
    },
  },
  {
    id: 'plum',
    name: '梅紫',
    desc: '偏红的紫，柔和有情绪，适合生活向内容',
    swatch: ['#9d174d', '#a21caf', '#be185d'],
    vars: {
      '--bg': '#fdfbfc', '--bg-soft': '#f8f0f4',
      '--text': '#1f141a', '--text-muted': '#5c4650', '--text-dim': '#9b8189',
      '--accent': '#9d174d', '--accent-2': '#a21caf', '--accent-3': '#be185d',
      '--glow-1': '#fbcfe8', '--glow-2': '#e9d5ff', '--glow-3': '#fecdd3',
      '--glow-1-o': '.5', '--glow-2-o': '.42', '--glow-3-o': '.35',
      '--grad': 'linear-gradient(110deg, #831843 0%, #9d174d 35%, #a21caf 70%, #be185d 100%)',
    },
  },
];
