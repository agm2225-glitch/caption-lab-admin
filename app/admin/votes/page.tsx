import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";
import { displayName, fmtDate, type Prof } from "@/lib/format";

export default async function VotesPage() {
  await requireAdmin();
  const db = adminDb();
  const [v, c, p] = await Promise.all([
    db.from("votes").select("id,caption_id,user_id,vote_type,created_at")
      .order("created_at", { ascending: false }).limit(200),
    db.from("captions").select("id,caption_text"),
    db.from("profiles").select("id,first_name,last_name"),
  ]);
  const votes = v.data ?? [];
  const caps = new Map((c.data ?? []).map((x) => [x.id, x.caption_text as string | null]));
  const pm = new Map(((p.data ?? []) as Prof[]).map((x) => [x.id, x]));

  return (
    <div>
      <h1 className="page-title">Votes<span className="cursor">_</span></h1>
      <p className="page-sub mb-6">latest {votes.length} · read-only</p>
      <div className="panel overflow-x-auto">
        <table className="t">
          <thead>
            <tr><th>when</th><th>user</th><th>vote</th><th>caption</th></tr>
          </thead>
          <tbody>
            {votes.map((x) => (
              <tr key={x.id}>
                <td className="mono whitespace-nowrap c-dim">{fmtDate(x.created_at)}</td>
                <td>{displayName(pm.get(x.user_id))}</td>
                <td>
                  <span className={`badge ${x.vote_type === "up" ? "badge-up" : "badge-down"}`}>
                    {x.vote_type === "up" ? "↑ up" : "↓ down"}
                  </span>
                </td>
                <td className="max-w-md truncate">{caps.get(x.caption_id) ?? "(deleted)"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}