import { useMemo, useState } from 'react';

import { CHAINS, DEFAULT_CHAIN_ID } from '../lib/mhxy/chains';
import { calculate, RATE_BASE } from '../lib/mhxy/calc';
import { formatBig, formatCount } from '../lib/mhxy/format';

/** { 3:1, 5:1 } → 「3级×1、5级×1」 */
function describeExtra(extra: Record<number, number>): string {
  return Object.entries(extra)
    .map(([lvl, n]) => [Number(lvl), n] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([lvl, n]) => `${lvl}级×${n}`)
    .join('、');
}

/** 完整配方：主料（N 颗低一级）+ 必定成功要求的附加 */
function describeRecipe(tier: { level: number; fromLower: number; extra: Record<number, number> }) {
  if (tier.fromLower === 0) return null;          // 1 级是底层，合不出来
  const main = `${tier.fromLower}×${tier.level - 1}级`;
  const ex = describeExtra(tier.extra);
  return { main, ex };
}

function Num({
  label, value, onChange, min = 0, max, step = 1, hint,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; hint?: string;
}) {
  return (
    <label className="fld">
      <span className="fld-l">
        {label}
        {hint && <i>{hint}</i>}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.max(min, max ? Math.min(max, n) : n) : min);
        }}
      />
    </label>
  );
}

export default function SynthesisCalc() {
  const [chainId, setChainId] = useState<string>(DEFAULT_CHAIN_ID);
  const [targetLevel, setTargetLevel] = useState(12);
  const [unitPriceWan, setUnitPriceWan] = useState(2);
  const unitPrice = unitPriceWan * 10_000;   // 算法内部仍用梦幻币
  const [staminaPrice, setStaminaPrice] = useState(0);
  const [cnyPer30M, setCnyPer30M] = useState(0);

  const chain = CHAINS.find((c) => c.id === chainId) ?? CHAINS[0];
  // 切换材料后目标等级可能越界，夹一下
  const level = Math.min(targetLevel, chain.maxLevel);

  const result = useMemo(
    () => calculate({ chain, targetLevel: level, unitPrice, staminaPrice, cnyPer30M }),
    [chain, level, unitPrice, staminaPrice, cnyPer30M]
  );

  // 每一级单独算一遍：合成 1 颗该级，从头到尾要吃多少
  const ladder = useMemo(
    () =>
      Array.from({ length: chain.maxLevel - 1 }, (_, i) => {
        const lv = i + 2;
        return { lv, ...calculate({ chain, targetLevel: lv, unitPrice, staminaPrice, cnyPer30M }) };
      }),
    [chain, unitPrice, staminaPrice, cnyPer30M]
  );

  return (
    <div className="calc">
      {/* ── 材料 ── */}
      <div className="chips">
        {CHAINS.map((c) => (
          <button
            key={c.id}
            className={c.id === chainId ? 'chip on' : 'chip'}
            onClick={() => setChainId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ── 参数 ── */}
      <div className="grid">
        <Num
          label="目标等级" value={level} onChange={setTargetLevel}
          min={1} max={chain.maxLevel} hint={`最高 ${chain.maxLevel}`}
        />
        <Num
          label="1 级单价" value={unitPriceWan} onChange={setUnitPriceWan}
          step={0.1} hint="万"
        />
        <Num
          label="体力单价" value={staminaPrice} onChange={setStaminaPrice}
          step={100} hint="梦幻币/点"
        />
        <Num
          label="汇率" value={cnyPer30M} onChange={setCnyPer30M}
          step={10} hint="元 / 3000万"
        />
      </div>

      {/* ── 结论 ── */}
      <div className="stats">
        <div className="stat big">
          <span className="k">需自备 1 级{chain.unit === '颗' ? '宝石' : '材料'}</span>
          <span className="v">{formatCount(result.baseNeeded)} <i>{chain.unit}</i></span>
        </div>
        <div className="stat">
          <span className="k">合成次数</span>
          <span className="v">{formatCount(result.totalSyntheses)}</span>
        </div>
        <div className="stat">
          <span className="k">体力消耗</span>
          <span className="v">
            {chain.staminaKnown ? formatCount(result.totalStamina) : '未公布'}
          </span>
        </div>
        <div className="stat">
          <span className="k">技能要求</span>
          <span className="v">
            {result.requiredSkill !== null
              ? `${chain.skillName} ${result.requiredSkill} 级`
              : '无'}
          </span>
        </div>
      </div>

      {/* ── 成本 ── */}
      <div className="cost">
        <div className="cost-row">
          <span>材料</span>
          <b>{formatBig(result.materialCost)}</b>
        </div>
        {staminaPrice > 0 && (
          <div className="cost-row">
            <span>体力折价</span>
            <b>{formatBig(result.staminaCost)}</b>
          </div>
        )}
        {chain.goldCostKnown && result.feeCost > 0 && (
          <div className="cost-row">
            <span>手续费</span>
            <b>{formatBig(result.feeCost)}</b>
          </div>
        )}
        <div className="cost-row total">
          <span>合计</span>
          <b>{formatBig(result.totalCost)} 梦幻币</b>
        </div>
        {cnyPer30M > 0 && (
          <div className="cost-row cny">
            <span>折合现金</span>
            <b>¥ {result.realCost.toFixed(2)}</b>
          </div>
        )}
      </div>

      {/* ── 各级换算 ── */}
      <p className="tip">
        每一行都是独立的：合成 <b>1 颗</b>该等级，从 1 级开始一路合上来的总消耗。
      </p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>等级</th>
              <th>合成配方</th>
              <th className="n">需 1 级{chain.unit === '颗' ? '宝石' : '材料'}</th>
              <th className="n">合成次数</th>
              <th className="n">体力</th>
              <th className="n">花费</th>
            </tr>
          </thead>
          <tbody>
            {ladder.map((row) => {
              const tier = chain.tiers[row.lv - 1];
              const recipe = describeRecipe(tier);
              return (
                <tr key={row.lv} className={row.lv === level ? 'cur' : undefined}>
                  <td>
                    <b>{row.lv} 级</b>
                    {row.lv === level && <em className="tgt">目标</em>}
                  </td>
                  <td className="sm recipe">
                    {recipe && (
                      <>
                        <b>{recipe.main}</b>
                        {recipe.ex && <span className="plus"> + {recipe.ex}</span>}
                      </>
                    )}
                  </td>
                  <td className="n strong">{formatCount(row.baseNeeded)}</td>
                  <td className="n dim">{formatCount(row.totalSyntheses)}</td>
                  <td className="n dim">
                    {chain.staminaKnown ? formatCount(row.totalStamina) : '—'}
                  </td>
                  <td className="n dim">{formatBig(row.totalCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── 规则 ── */}
      <details className="rules">
        <summary>{chain.name}的合成规则</summary>
        <ul>
          {chain.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
        {chain.inferred.length > 0 && (
          <>
            <p className="inf-h">以下是推断，不是公告原文：</p>
            <ul className="inf">
              {chain.inferred.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </>
        )}
        <p className="src">
          出处：<a href={chain.source} target="_blank" rel="noopener">{chain.sourceLabel}</a>
          {!chain.goldCostKnown && ' · 合成手续费官方未公布，按 0 计'}
        </p>
      </details>

      <style>{`
        .calc { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.75rem; }

        .chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .chip {
          font: inherit; font-size: 0.86rem; padding: 0.35rem 0.85rem;
          border: 1px solid var(--border); border-radius: 999px;
          background: #fff; color: var(--text-muted); cursor: pointer;
          transition: 0.15s;
        }
        .chip:hover { border-color: var(--text-dim); color: var(--text); }
        .chip.on { background: var(--text); border-color: var(--text); color: #fff; }

        .grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 720px) { .grid { grid-template-columns: repeat(4, 1fr); } }

        .fld { display: flex; flex-direction: column; gap: 0.3rem; }
        .fld-l { font-size: 0.82rem; color: var(--text-muted);
                 display: flex; justify-content: space-between; align-items: baseline; gap: 0.4rem; }
        .fld-l i { font-style: normal; font-size: 0.72rem; color: var(--text-dim); }
        .fld input {
          font: inherit; font-family: var(--mono); font-size: 0.92rem;
          padding: 0.5rem 0.65rem; width: 100%;
          border: 1px solid var(--border); border-radius: 8px;
          background: #fff; color: var(--text);
        }
        .fld input:focus {
          outline: none; border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(26,95,208,0.1);
        }

        .stats {
          display: grid; gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 720px) { .stats { grid-template-columns: repeat(4, 1fr); } }
        .stat { background: #fff; padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .stat .k { font-size: 0.76rem; color: var(--text-dim); }
        .stat .v { font-size: 1.15rem; font-weight: 600; font-variant-numeric: tabular-nums;
                   letter-spacing: -0.01em; }
        .stat .v i { font-style: normal; font-size: 0.78rem; font-weight: 400; color: var(--text-dim); }
        .stat.big .v { font-size: 1.5rem; }

        .cost {
          border: 1px solid var(--border); border-radius: var(--radius);
          padding: 0.4rem 1rem; background: var(--bg-soft);
        }
        .cost-row {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 0.45rem 0; font-size: 0.9rem; color: var(--text-muted);
        }
        .cost-row b { font-variant-numeric: tabular-nums; color: var(--text); font-weight: 550; }
        .cost-row.total { border-top: 1px solid var(--border); margin-top: 0.15rem; padding-top: 0.6rem; }
        .cost-row.total b { font-size: 1.05rem; }
        .cost-row.cny b { color: var(--accent); }

        .tip { margin: 0; font-size: 0.82rem; color: var(--text-muted); line-height: 1.7; }
        .tip b { color: var(--text); font-weight: 550; }
        thead th.sub { color: var(--text-dim); font-weight: 400; }

        .tablewrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
        thead th {
          text-align: left; font-weight: 500; font-size: 0.76rem; color: var(--text-dim);
          padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border);
          white-space: nowrap; background: var(--bg-soft);
        }
        tbody td { padding: 0.55rem 0.75rem; border-bottom: 1px solid var(--border); white-space: nowrap; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr.cur { background: var(--bg-soft); }
        tbody tr.cur td:first-child { box-shadow: inset 2px 0 0 var(--text); }
        .strong { font-weight: 600; }
        .n { text-align: right; font-variant-numeric: tabular-nums; }
        th.n { text-align: right; }
        .dim { color: var(--text-dim); }
        .sm { font-size: 0.78rem; }
        .tgt {
          font-style: normal; font-size: 0.68rem; font-weight: 400;
          margin-left: 0.4rem; padding: 0.08rem 0.32rem; border-radius: 4px;
          background: var(--text); color: #fff; vertical-align: 1px;
        }

        .recipe b { font-weight: 550; color: var(--text); }
        .recipe .plus { color: var(--text-dim); }

        .tagbase {
          font-size: 0.74rem; padding: 0.1rem 0.4rem; border-radius: 5px;
          background: var(--text); color: #fff;
        }

        .rules { font-size: 0.88rem; }
        .rules summary { cursor: pointer; color: var(--text-muted); padding: 0.3rem 0; }
        .rules summary:hover { color: var(--text); }
        .rules ul { margin: 0.6rem 0 0; padding-left: 1.1rem; color: var(--text-muted); line-height: 1.7; }
        .rules .inf-h { margin: 0.9rem 0 0.3rem; font-size: 0.82rem; color: var(--text-dim); }
        .rules .inf { font-size: 0.85rem; }
        .rules .src { margin: 0.9rem 0 0; font-size: 0.8rem; color: var(--text-dim); }
      `}</style>
    </div>
  );
}
