import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

const toLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/** 秒 / 毫秒都吃，自动判断 */
function parseTimestamp(raw: string): Date | null {
  const n = Number(raw.trim());
  if (!raw.trim() || !Number.isFinite(n)) return null;
  const ms = raw.trim().length <= 10 ? n * 1000 : n;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimestampTool() {
  const [now, setNow] = useState(() => Date.now());
  const [input, setInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsed = parseTimestamp(input);
  const fromDate = dateInput ? new Date(dateInput.replace(' ', 'T')) : null;
  const fromDateValid = fromDate && !Number.isNaN(fromDate.getTime());

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="tool">
      <div className="row">
        <span className="label">当前时间戳</span>
        <code className="value">{Math.floor(now / 1000)}</code>
        <button onClick={() => copy(String(Math.floor(now / 1000)))}>复制秒</button>
        <button onClick={() => copy(String(now))}>复制毫秒</button>
      </div>

      <label>
        时间戳 → 日期<span className="hint">（秒或毫秒都行）</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="1758240000"
          inputMode="numeric"
        />
      </label>
      {input && (
        <output>
          {parsed ? (
            <>
              <div>本地时间　<code>{toLocal(parsed)}</code></div>
              <div>UTC　　　<code>{parsed.toISOString()}</code></div>
            </>
          ) : (
            <span className="err">解析不了，检查一下输入</span>
          )}
        </output>
      )}

      <label>
        日期 → 时间戳
        <input
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          placeholder="2026-09-19 12:00:00"
        />
      </label>
      {dateInput && (
        <output>
          {fromDateValid ? (
            <>
              <div>秒　　<code>{Math.floor(fromDate.getTime() / 1000)}</code></div>
              <div>毫秒　<code>{fromDate.getTime()}</code></div>
            </>
          ) : (
            <span className="err">格式认不出来，试试 2026-09-19 12:00:00</span>
          )}
        </output>
      )}

      <style>{`
        .tool { display: flex; flex-direction: column; gap: 1.1rem; margin-top: 1.5rem; }
        .row { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
               padding: 1rem 1.15rem; background: var(--surface-solid);
               box-shadow: var(--shadow-sm);
               border: 1px solid var(--border); border-radius: var(--radius-lg); }
        .label { font-size: 0.85rem; color: var(--text-muted); }
        .value { font-size: 1rem; }
        label { display: flex; flex-direction: column; gap: 0.4rem;
                font-size: 0.9rem; color: var(--text-muted); }
        .hint { font-size: 0.8rem; opacity: 0.7; }
        input { font-family: var(--mono); font-size: 0.95rem; padding: 0.7rem 0.85rem;
                border: 1px solid var(--border); border-radius: var(--radius);
                background: var(--surface-solid); color: var(--text); width: 100%;
                transition: border-color .18s, box-shadow .18s; }
        input:hover { border-color: var(--border-strong); }
        input:focus { outline: none; border-color: var(--accent);
                      box-shadow: 0 0 0 3px rgba(109,74,255,0.13); }
        button { font-size: 0.8rem; padding: 0.35rem 0.7rem; cursor: pointer;
                 border: 1px solid var(--border); border-radius: 8px;
                 background: var(--bg-soft); color: var(--text-muted);
                 transition: .18s; }
        button:hover { border-color: var(--accent); color: var(--accent);
                       background: var(--surface-solid); box-shadow: var(--shadow-sm); }
        output { display: flex; flex-direction: column; gap: 0.4rem;
                 font-size: 0.9rem; padding: 0.85rem 1.1rem; margin-top: -0.5rem;
                 background: var(--bg-soft);
                 border: 1px solid var(--border);
                 border-radius: var(--radius); white-space: pre;
                 animation: rise .35s var(--ease) both; }
        .err { color: var(--accent); }
      `}</style>
    </div>
  );
}
