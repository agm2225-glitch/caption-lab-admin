import Link from "next/link";
import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";
import { fmtDate } from "@/lib/format";
import { deleteCaption } from "./actions";

export default async function CaptionsPage() {
  await requireAdmin();
  const { data } = await adminDb().from("captions").select("*").order("created_at", { ascending: false });
  const caps = data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="page-title">Captions<span className="cursor">_</span></h1>
          <p className="page-sub">{caps.length} total · create, edit, delete</p>
        </div>
        <Link href="/admin/captions/new" className="btn">$ new_caption</Link>
      </div>
      <div className="panel overflow-x-auto">
        <table className="t">
          <thead>
            <tr><th>image</th><th>caption</th><th>flavor</th><th>created</th><th></th></tr>
          </thead>
          <tbody>
            {caps.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="h-14 w-14 rounded-sm border border-[var(--line-hi)] bg-[#0f171a] bg-cover bg-center"
                    style={c.image_url ? { backgroundImage: `url(${c.image_url})` } : undefined} />
                </td>
                <td className="max-w-md">{c.caption_text}</td>
                <td>{c.flavor && <span className="badge badge-flavor">{c.flavor}</span>}</td>
                <td className="mono whitespace-nowrap c-dim">{fmtDate(c.created_at)}</td>
                <td>
                  <div className="flex gap-2">
                    <Link href={`/admin/captions/${c.id}`} className="btn btn-ghost">edit</Link>
                    <form action={deleteCaption}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="btn btn-danger">delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}