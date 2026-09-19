// 各类材料的合成规则
//
// 主要出处：官方公告「部分系统及玩法规则调整」（2024-05-20）
//   https://xyq.163.com/news/20240520/4999_1156134.html
// 五色灵尘：官方公告（2025-04-16）
//   https://xyq.163.com/news/20250416/4999_1227842.html
//
// 已核对至 2026-08-02：1188 份维护公告中无对以上合成规则的进一步调整。
//
// 每条链的 inferred 字段列出「不是公告原文、由我推断」的部分，界面会标出来。

import { type Chain, type Tier } from './types';

const SRC_2024 = 'https://xyq.163.com/news/20240520/4999_1156134.html';
const SRC_WUSE = 'https://xyq.163.com/news/20250416/4999_1227842.html';

/** 构造一条「N 个低一级 + 额外提交」的链 */
function buildTiers(opts: {
  maxLevel: number;
  /** 目标等级 → 需要几个低一级；返回 undefined 用默认值 2 */
  fromLower?: (level: number) => number;
  extra?: Record<number, Record<number, number>>;
  /** 目标等级 → 体力；返回 null 表示未公布 */
  stamina?: (level: number) => number | null;
  goldCost?: (level: number) => number | null;
  skillMin?: (level: number) => number | null;
}): Tier[] {
  const { maxLevel, fromLower, extra = {}, stamina, goldCost, skillMin } = opts;
  return Array.from({ length: maxLevel }, (_, i) => {
    const level = i + 1;
    if (level === 1) {
      return {
        level,
        fromLower: 0,
        extra: {},
        stamina: null,
        goldCost: null,
        skillMin: null,
      };
    }
    return {
      level,
      fromLower: fromLower ? fromLower(level) : 2,
      extra: extra[level] ?? {},
      stamina: stamina ? stamina(level) : null,
      goldCost: goldCost ? goldCost(level) : null,
      skillMin: skillMin ? skillMin(level) : null,
    };
  });
}

// ── 宝石 ────────────────────────────────────────────────────
const GEM: Chain = {
  id: 'gem',
  name: '宝石',
  unit: '颗',
  maxLevel: 20,
  skillName: '宝石工艺',
  staminaKnown: true,
  goldCostKnown: false,
  source: SRC_2024,
  sourceLabel: '2024-05-20 公告',
  tiers: buildTiers({
    maxLevel: 20,
    extra: {
      12: { 3: 1, 5: 1, 6: 1 },
      13: { 9: 1 },
      14: { 9: 1, 10: 1 },
      15: { 9: 1, 12: 1 },
      16: { 11: 1, 12: 1, 13: 1 },
      17: { 15: 1 },
      18: { 13: 1, 14: 1, 16: 1 },
      19: { 15: 1, 16: 1, 17: 1 },
      20: { 17: 1, 18: 2 },
    },
    // 体力 = 原料宝石等级 × 10，原料等级即目标等级 - 1
    stamina: (level) => (level - 1) * 10,
    skillMin: (level) => {
      if (level <= 3) return 3;
      if (level <= 5) return 4;
      if (level <= 7) return 5;
      if (level <= 9) return 6;
      return 7;
    },
  }),
  notes: [
    '2 颗同级同类型宝石合成 1 颗高一级宝石。',
    '合成 12~20 级时必定成功，但需额外提交指定等级的同类型宝石。',
    '体力消耗 = 原料宝石等级 × 10。',
  ],
  inferred: [],
};

// ── 星辉石 ──────────────────────────────────────────────────
const XINGHUI: Chain = {
  id: 'xinghuishi',
  name: '星辉石',
  unit: '颗',
  maxLevel: 11,
  skillName: '宝石工艺',
  staminaKnown: true,
  goldCostKnown: false,
  source: SRC_2024,
  sourceLabel: '2024-05-20 公告',
  tiers: buildTiers({
    maxLevel: 11,
    // 星辉石是三合一，不是宝石那样的二合一
    fromLower: () => 3,
    extra: {
      9: { 5: 1 },
      10: { 6: 1, 7: 1 },
      11: { 9: 1 },
    },
    // 60/90/120/…/330 对应目标等级 2~11，即目标等级 × 30
    stamina: (level) => level * 30,
    skillMin: (level) => {
      if (level === 2) return 4;
      if (level <= 5) return 5;
      if (level <= 7) return 6;
      return 7;
    },
  }),
  notes: [
    '3 颗同级星辉石合成 1 颗高一级星辉石。',
    '合成 9~11 级时必定成功，但需额外提交指定等级的星辉石。',
    '体力消耗 = 目标等级 × 30（60 / 90 / … / 330 对应 2~11 级）。',
  ],
  inferred: [],
};

// ── 钟灵石 ──────────────────────────────────────────────────
// 唯一一条原料数量随等级变动的链，公告给了完整表格
const ZHONGLING_FROM_LOWER: Record<number, number> = {
  2: 3,
  3: 3,
  4: 4,
  5: 3,
  6: 4,
  7: 4,
  8: 5,
};

const ZHONGLING: Chain = {
  id: 'zhonglingshi',
  name: '钟灵石',
  unit: '个',
  maxLevel: 8,
  skillName: null,
  staminaKnown: true,
  goldCostKnown: true,
  source: SRC_2024,
  sourceLabel: '2024-05-20 公告',
  tiers: buildTiers({
    maxLevel: 8,
    fromLower: (level) => ZHONGLING_FROM_LOWER[level] ?? 2,
    // 10/20/…/70 对应目标等级 2~8，即原料等级 × 10
    stamina: (level) => (level - 1) * 10,
    // 1/4/9/16/25/36/49 万，即 10000 × 原料等级²
    goldCost: (level) => 10_000 * (level - 1) ** 2,
  }),
  notes: [
    '必定成功，目标等级固定为「原材料等级 + 1」。',
    '原料数量不是固定 2 个，按目标等级在 3~5 之间变动。',
    '无额外提交要求。',
    '体力消耗 = 原料等级 × 10（10 / 20 / … / 70 对应 2~8 级）。',
    '合成手续费 = 1 万 × 原料等级²（1 / 4 / 9 / … / 49 万）。',
  ],
  inferred: [],
};

// ── 五色灵尘 ────────────────────────────────────────────────
// 唯一一条「吃 2 个低一级 + 1 个低两级」的链
const WUSE: Chain = {
  id: 'wuselingchen',
  name: '五色灵尘',
  unit: '个',
  maxLevel: 15,
  skillName: null,
  staminaKnown: true,
  goldCostKnown: false,
  source: SRC_WUSE,
  sourceLabel: '2025-04-16 公告',
  tiers: buildTiers({
    maxLevel: 15,
    // 60/90/120/150…450 对应目标等级 2~15，即目标等级 × 30
    stamina: (level) => level * 30,
    // 3 级及以上除了 2 个低 1 级，还要 1 个低 2 级
    extra: Object.fromEntries(
      Array.from({ length: 13 }, (_, i) => {
        const level = i + 3; // 3..15
        return [level, { [level - 2]: 1 }];
      }),
    ),
  }),
  notes: [
    '合成 2 级需 2 个 1 级。',
    '合成 3 级及以上需 2 个低 1 级 + 1 个低 2 级，必定成功。',
    '等级上限随版本解锁，2026-02-01 后为 15 级。',
    '体力消耗 = 目标等级 × 30（60 / 90 / … / 450 对应 2~15 级）。',
  ],
  inferred: [],
};

// ── 精魄灵石 ────────────────────────────────────────────────
const JINGPO: Chain = {
  id: 'jingpolingshi',
  name: '精魄灵石',
  unit: '颗',
  maxLevel: 10,
  skillName: '灵石技巧',
  staminaKnown: false,
  goldCostKnown: true,
  source: SRC_2024,
  sourceLabel: '2024-05-20 公告',
  tiers: buildTiers({
    maxLevel: 10,
    extra: {
      8: { 3: 1 },
      9: { 6: 1 },
      10: { 8: 1 },
    },
    // 精魄灵石合成不扣梦幻币
    goldCost: () => 0,
    skillMin: (level) => {
      const table: Record<number, number> = {
        2: 58,
        3: 65,
        4: 73,
        5: 80,
        6: 88,
        7: 95,
      };
      return table[level] ?? 100; // 8~10 级
    },
  }),
  notes: [
    '2 颗同级精魄灵石合成 1 颗高一级精魄灵石。',
    '合成 8~10 级时必定成功，但需额外提交指定等级的同类型精魄灵石。',
    '技能门槛为「灵石技巧」，2 级即需 58 级技能。',
    '合成不消耗梦幻币手续费。',
  ],
  inferred: ['体力消耗数值未知，因此不计入总计。'],
};

// ── 玄灵珠 ──────────────────────────────────────────────────
const XUANLING: Chain = {
  id: 'xuanlingzhu',
  name: '玄灵珠',
  unit: '颗',
  maxLevel: 8,
  skillName: null,
  staminaKnown: true,
  goldCostKnown: false,
  source: SRC_2024,
  sourceLabel: '2024-05-20 公告',
  tiers: buildTiers({
    maxLevel: 8,
    // 玄灵珠是三合一
    fromLower: () => 3,
    // 20/40/…/140 对应目标等级 2~8，即原料等级 × 20
    stamina: (level) => (level - 1) * 20,
    extra: {
      // 4 级公告明确写「无需额外添加」
      5: { 2: 1 },
      6: { 3: 1 },
      7: { 4: 1 },
      8: { 5: 1 },
    },
  }),
  notes: [
    '3 颗同级玄灵珠合成 1 颗高一级玄灵珠。',
    '合成 4~8 级时必定成功。4 级无需额外添加，5 级起需额外提交 1 颗低 2 级的同类型玄灵珠。',
    '体力消耗 = 原料等级 × 20（20 / 40 / … / 140 对应 2~8 级）。',
  ],
  inferred: [],
};

export const CHAINS: readonly Chain[] = [
  GEM,
  XINGHUI,
  ZHONGLING,
  WUSE,
  JINGPO,
  XUANLING,
];

export const DEFAULT_CHAIN_ID = GEM.id;
