export type Tier = {
  level: number;
  /**
   * 合成 1 个本级需要几个「低一级」产物。
   * 1 级是链底层，为 0。多数材料是 2，钟灵石按目标等级在 3~5 之间变动。
   */
  fromLower: number;
  /**
   * 额外提交的同类型材料：等级 → 数量。
   * 提交的等级可以跨好几级（如 20 级宝石要 17 级 1 颗 + 18 级 2 颗），
   * 所以需求不是一条链，而是一张只指向更低等级的有向图。
   */
  extra: Record<number, number>;
  /** 每次合成消耗的体力；null 表示官方未公布 */
  stamina: number | null;
  /** 每次合成消耗的梦幻币手续费；null 表示官方未公布 */
  goldCost: number | null;
  /** 所需技能等级下限；null 表示无门槛或未公布 */
  skillMin: number | null;
};

export type Chain = {
  id: string;
  name: string;
  /** 单位，如「颗」「个」 */
  unit: string;
  maxLevel: number;
  /** 按 level 升序，index 0 是 1 级 */
  tiers: readonly Tier[];
  /** 技能名，如「宝石工艺」；null 表示公告未提及门槛 */
  skillName: string | null;
  /** 体力数值是否已知 */
  staminaKnown: boolean;
  /** 合成手续费数值是否已知 */
  goldCostKnown: boolean;
  /** 规则出处 */
  source: string;
  sourceLabel: string;
  notes: readonly string[];
  /**
   * 推断而非公告原文的部分。界面上会明确标出，
   * 免得把没把握的数字当成官方数据用。
   */
  inferred: readonly string[];
};
