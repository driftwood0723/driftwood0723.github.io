import { type Chain } from './types';

export type CalcInput = {
  chain: Chain;
  targetLevel: number;
  /** 1 级材料单价（梦幻币/个） */
  unitPrice: number;
  /** 体力单价（梦幻币/点） */
  staminaPrice: number;
  /** 汇率：每 3000 万梦幻币折多少现金（元）。0 表示不折算。 */
  cnyPer30M: number;
};

/** 汇率的基准面额：3000 万梦幻币 */
export const RATE_BASE = 30_000_000;

export type LevelRow = {
  level: number;
  /** 这一级总共需要多少个 */
  needed: number;
  /** 其中被高一级当作原料吃掉的 */
  asMaterial: number;
  /** 其中被「必定成功」规则要求额外提交的 */
  asExtra: number;
  /** 需要合成多少个 */
  toSynthesize: number;
  /** 合不出来、只能自行准备的（仅 1 级非 0） */
  shortfall: number;
  /** 这一级合成消耗的体力小计 */
  stamina: number;
  /** 这一级合成手续费小计 */
  fee: number;
};

export type CalcResult = {
  /** 按等级从高到低，只含有需求的层 */
  rows: LevelRow[];
  /** 需要自行准备的 1 级材料总数 */
  baseNeeded: number;
  totalSyntheses: number;
  totalStamina: number;
  /** 买 1 级材料的钱 */
  materialCost: number;
  /** 体力折算成的钱 */
  staminaCost: number;
  /** 合成手续费合计（游戏内直接扣的梦幻币） */
  feeCost: number;
  /** 梦幻币总计 */
  totalCost: number;
  /** 折算成现金的真实价值（元）；汇率为 0 时是 0 */
  realCost: number;
  /** 所需的最高技能等级；null 表示该材料无技能门槛 */
  requiredSkill: number | null;
};

/**
 * 自顶向下推算合成消耗。
 *
 * 每一级的需求有两个来源：
 *   1. 高一级把它当原料吃掉（fromLower 个）
 *   2. 某个更高级的「必定成功」合成要求额外提交它
 *
 * 因为额外提交只会指向更低的等级，按等级从高到低遍历时，
 * 走到第 L 级，它的全部需求必然已经累加完毕 —— 天然的拓扑序，
 * 不需要建图也不需要迭代到收敛。
 */
export function calculate({
  chain,
  targetLevel,
  unitPrice,
  staminaPrice,
  cnyPer30M,
}: CalcInput): CalcResult {
  // 分开记录两种来源，好在明细里解释「为什么需要这么多」
  const needAsMaterial = new Map<number, number>();
  const needAsExtra = new Map<number, number>();

  const bump = (map: Map<number, number>, level: number, amount: number) => {
    map.set(level, (map.get(level) ?? 0) + amount);
  };

  const rows: LevelRow[] = [];
  let baseNeeded = 0;
  let totalSyntheses = 0;
  let totalStamina = 0;
  let totalFee = 0;
  let requiredSkill: number | null = null;

  for (let level = targetLevel; level >= 1; level--) {
    const asMaterial = needAsMaterial.get(level) ?? 0;
    const asExtra = needAsExtra.get(level) ?? 0;
    const needed = asMaterial + asExtra + (level === targetLevel ? 1 : 0);
    if (needed <= 0) continue;

    const tier = chain.tiers[level - 1];
    let toSynthesize = 0;
    let shortfall = 0;
    let stamina = 0;
    let fee = 0;

    if (tier.fromLower === 0) {
      // 1 级是链底层，合不出来，只能自己买或刷
      shortfall = needed;
      baseNeeded += needed;
    } else {
      toSynthesize = needed;
      totalSyntheses += needed;

      // 官方未公布数值的，按 0 计
      stamina = needed * (tier.stamina ?? 0);
      totalStamina += stamina;
      fee = needed * (tier.goldCost ?? 0);
      totalFee += fee;

      if (tier.skillMin !== null) {
        requiredSkill = Math.max(requiredSkill ?? 0, tier.skillMin);
      }

      bump(needAsMaterial, level - 1, needed * tier.fromLower);
      for (const [lvl, count] of Object.entries(tier.extra)) {
        bump(needAsExtra, Number(lvl), needed * count);
      }
    }

    rows.push({
      level,
      needed,
      asMaterial,
      asExtra,
      toSynthesize,
      shortfall,
      stamina,
      fee,
    });
  }

  const materialCost = baseNeeded * unitPrice;
  const staminaCost = totalStamina * staminaPrice;
  const totalCost = materialCost + staminaCost + totalFee;

  return {
    rows,
    baseNeeded,
    totalSyntheses,
    totalStamina,
    materialCost,
    staminaCost,
    feeCost: totalFee,
    totalCost,
    realCost: (totalCost / RATE_BASE) * cnyPer30M,
    requiredSkill,
  };
}
