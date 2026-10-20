import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";
import { displayName, type Prof } from "@/lib/format";

type Cap = { id: string; user_id: string | null; caption_text: string | null; flavor: string | null };
type Vote = { caption_id: string; user_id: string; vote_type: string; created_at: string };

function Stat({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="panel p-5">
      <div className="label slashes">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="mt-1 text-sm c-dim">{sub}</div>
    </div>
  );
}

function Card({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <span className="label slashes">{title}</span>
        {meta && <span className="mono text-sm c-dim">{meta}</span>}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function Row({ label, value, max, text, color = "var(--accent)" }: {
  label: string; value: number; max: number; text: string; color?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex justify-between gap-4 text-[0.95rem]">
        <span className="truncate">{label}</span>
        <span className="mono shrink-0" style={{ color }}>{text}</span>
      </div>
      <div className="meter" style={{ color }}>
        <i style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

const cut = (s: string | null) => (s ? (s.length > 46 ? s.slice(0, 46) + "…" : s) : "(no text)");

export default async function Dashboard() {
  await requireAdmin();
  const db = adminDb();
  const [c, v, p] = await Promise.all([
    db.from("captions").select("id,user_id,caption_text,flavor"),
    db.from("votes").select("caption_id,user_id,vote_type,created_at"),
    db.from("profiles").select("id,first_name,last_name,is_superadmin"),
  ]);
  const caps = (c.data ?? []) as Cap[];
  const votes = (v.data ?? []) as Vote[];
  const profs = (p.data ?? []) as (Prof & { is_superadmin: boolean | null })[];
  const pm = new Map(profs.map((x) => [x.id, x]));

  const tally = new Map<string, { up: number; down: number }>();
  for (const x of votes) {
    const t = tally.get(x.caption_id) ?? { up: 0, down: 0 };
    if (x.vote_type === "up") t.up++;
    else t.down++;
    tally.set(x.caption_id, t);
  }
  const rows = caps.map((x) => {
    const t = tally.get(x.id) ?? { up: 0, down: 0 };
    return { ...x, ...t, net: t.up - t.down };
  });

  const top = [...rows].sort((a, b) => b.net - a.net).slice(0, 5);
  const topMax = Math.max(1, ...top.map((r) => Math.abs(r.net)));
  const contro = rows
    .filter((r) => r.up > 0 && r.down > 0)
    .sort((a, b) => Math.min(b.up, b.down) - Math.min(a.up, a.down) || b.up + b.down - (a.up + a.down))
    .slice(0, 5);
  const controMax = Math.max(1, ...contro.map((r) => Math.min(r.up, r.down)));

  const fl = new Map<string, { n: number; up: number; down: number }>();
  for (const r of rows) {
    const k = r.flavor || "none";
    const t = fl.get(k) ?? { n: 0, up: 0, down: 0 };
    t.n++; t.up += r.up; t.down += r.down;
    fl.set(k, t);
  }
  const flavors = [...fl.entries()]
    .map(([k, t]) => ({ k, ...t, pct: t.up + t.down ? t.up / (t.up + t.down) : 0 }))
    .sort((a, b) => b.pct - a.pct);

  const perDay = new Map<string, number>();
  for (const x of votes) {
    const d = x.created_at.slice(0, 10);
    perDay.set(d, (perDay.get(d) ?? 0) + 1);
  }
  const days = [...perDay.entries()].sort().slice(-14);
  const dayMax = Math.max(1, ...days.map((d) => d[1]));

  const count = (ids: (string | null)[]) => {
    const m = new Map<string, number>();
    ids.forEach((i) => i && m.set(i, (m.get(i) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  };
  const creators = count(caps.map((x) => x.user_id));
  const voters = count(votes.map((x) => x.user_id));
  const upCount = votes.filter((x) => x.vote_type === "up").length;
  const approval = votes.length ? Math.round((upCount / votes.length) * 100) : 0;
  const admins = profs.filter((x) => x.is_superadmin).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Dashboard<span className="cursor">_</span></h1>
        <p className="page-sub">Live stats straight from the database.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="users" value={profs.length} sub={`${admins} superadmin${admins === 1 ? "" : "s"}`} color="var(--info)" />
        <Stat label="captions" value={caps.length} sub={`${flavors.length} flavors`} color="var(--accent)" />
        <Stat label="votes" value={votes.length} sub={`${upCount} up · ${votes.length - upCount} down`} color="var(--warn)" />
        <Stat label="approval" value={`${approval}%`} sub="of all votes are upvotes" color="var(--accent)" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="top captions" meta="net score">
          {top.map((r) => (
            <Row key={r.id} label={cut(r.caption_text)} value={Math.abs(r.net)} max={topMax}
              text={`${r.net > 0 ? "+" : ""}${r.net}`} color={r.net < 0 ? "var(--bad)" : "var(--accent)"} />
          ))}
        </Card>
        <Card title="most controversial" meta="split votes">
          {contro.length === 0 && <p className="c-dim">No split votes yet.</p>}
          {contro.map((r) => (
            <Row key={r.id} label={cut(r.caption_text)} value={Math.min(r.up, r.down)} max={controMax}
              text={`${r.up}↑ ${r.down}↓`} color="var(--warn)" />
          ))}
        </Card>
        <Card title="approval by flavor">
          {flavors.map((f) => (
            <Row key={f.k} label={f.k} value={f.pct} max={1}
              text={`${Math.round(f.pct * 100)}% · ${f.n} captions`} color="var(--info)" />
          ))}
        </Card>
        <Card title="votes per day" meta="last 14 days">
          <div className="flex h-36 items-end gap-1.5">
            {days.map(([d, n]) => (
              <div key={d} title={`${d}: ${n} votes`} className="flex-1 rounded-t-sm transition-opacity hover:opacity-70"
                style={{ height: `${(n / dayMax) * 100}%`, minHeight: 4, background: "var(--accent)", boxShadow: "0 0 10px rgba(77,255,176,.4)" }} />
            ))}
          </div>
          <div className="mono mt-3 flex justify-between text-sm c-dim">
            <span>{days[0]?.[0]}</span>
            <span>{days[days.length - 1]?.[0]}</span>
          </div>
        </Card>
        <Card title="top creators" meta="captions made">
          {creators.map(([id, n]) => (
            <Row key={id} label={displayName(pm.get(id))} value={n} max={creators[0][1]} text={`${n}`} />
          ))}
        </Card>
        <Card title="top voters" meta="votes cast">
          {voters.map(([id, n]) => (
            <Row key={id} label={displayName(pm.get(id))} value={n} max={voters[0][1]} text={`${n}`} color="var(--warn)" />
          ))}
        </Card>
      </div>
    </div>
  );
}