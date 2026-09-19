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
  const [unitPrice, setUnitPrice] = useState(20_000);
  const [staminaPrice, setStaminaPrice] = useState(0);
  const [cnyPer30M, setCnyPer30M] = useState(0);

  const chain = CHAINS.find((c) => c.id === chainId) ?? CHAINS[0];
  // 切换材料后目标等级可能越界，夹一下
  const level = Math.min(targetLevel, chain.maxLevel);

  const result = useMemo(
    () => calculate({ chain, targetLevel: level, unitPrice, staminaPrice, cnyPer30M }),
    [chain, level, unitPrice, staminaPrice, cnyPer30M]
  );

  // 理论下界要逐级连乘（钟灵石各级倍率不同），不能一律 2^(n-1)
  const naiveBase = useMemo(() => {
    let n = 1;
    for (let l = level; l >= 2; l--) n *= chain.tiers[l - 1].fromLower;
    return n;
  }, [chain, level]);
  const overhead = result.baseNeeded - naiveBase;

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
          label="1 级单价" value={unitPrice} onChange={setUnitPrice}
          step={1000} hint="梦幻币"
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

      {/* ── 额外提交带来的溢出 ── */}
      {overhead > 0 && (
        <p className="note">
          纯翻倍只需 <b>{formatCount(naiveBase)}</b> {chain.unit}，
          「必定成功」要求的额外提交多吃了 <b>{formatCount(overhead)}</b> {chain.unit}
          （多 {((overhead / naiveBase) * 100).toFixed(1)}%）。
        </p>
      )}

      {/* ── 明细 ── */}
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>等级</th>
              <th className="n">需要</th>
              <th className="n">被上级吃</th>
              <th className="n">额外提交</th>
              <th className="n">需合成</th>
              <th className="n">体力</th>
              <th>额外要求</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => {
              const tier = chain.tiers[r.level - 1];
              const ex = describeExtra(tier.extra);
              return (
                <tr key={r.level} className={r.shortfall > 0 ? 'base' : undefined}>
                  <td><b>{r.level} 级</b></td>
                  <td className="n">{formatCount(r.needed)}</td>
                  <td className="n dim">{r.asMaterial ? formatCount(r.asMaterial) : '—'}</td>
                  <td className="n dim">{r.asExtra ? formatCount(r.asExtra) : '—'}</td>
                  <td className="n">
                    {r.shortfall > 0
                      ? <span className="tagbase">自备 {formatCount(r.shortfall)}</span>
                      : formatCount(r.toSynthesize)}
                  </td>
                  <td className="n dim">{r.stamina ? formatCount(r.stamina) : '—'}</td>
                  <td className="dim sm">{ex || '—'}</td>
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

        .note { margin: 0; font-size: 0.85rem; color: var(--text-muted);
                padding: 0.7rem 0.9rem; background: var(--bg-soft);
                border-left: 2px solid var(--accent); border-radius: 0 8px 8px 0; }
        .note b { color: var(--text); font-variant-numeric: tabular-nums; }

        .tablewrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
        thead th {
          text-align: left; font-weight: 500; font-size: 0.76rem; color: var(--text-dim);
          padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border);
          white-space: nowrap; background: var(--bg-soft);
        }
        tbody td { padding: 0.55rem 0.75rem; border-bottom: 1px solid var(--border); white-space: nowrap; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr.base { background: var(--bg-soft); }
        .n { text-align: right; font-variant-numeric: tabular-nums; }
        th.n { text-align: right; }
        .dim { color: var(--text-dim); }
        .sm { font-size: 0.78rem; }
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
