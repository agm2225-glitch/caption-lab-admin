import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";
import { displayName, fmtDate } from "@/lib/format";

export default async function UsersPage() {
  await requireAdmin();
  const { data } = await adminDb()
    .from("profiles")
    .select("id,first_name,last_name,avatar_url,created_at,is_superadmin")
    .order("created_at", { ascending: false });
  const users = data ?? [];

  return (
    <div>
      <h1 className="page-title">Users<span className="cursor">_</span></h1>
      <p className="page-sub mb-6">{users.length} profiles · read-only</p>
      <div className="panel overflow-x-auto">
        <table className="t">
          <thead>
            <tr><th>user</th><th>id</th><th>joined</th><th>role</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full border border-[var(--line-hi)] bg-[#0f171a] bg-cover"
                      style={u.avatar_url ? { backgroundImage: `url(${u.avatar_url})` } : undefined} />
                    {displayName(u)}
                  </div>
                </td>
                <td className="mono c-dim">{u.id.slice(0, 8)}</td>
                <td>{fmtDate(u.created_at)}</td>
                <td>
                  <span className={`badge ${u.is_superadmin ? "badge-admin" : "badge-user"}`}>
                    {u.is_superadmin ? "superadmin" : "user"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}