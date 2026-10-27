import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";
import { TABLES, type Field } from "@/lib/tables";
import { createRow, updateRow, deleteRow } from "../actions";
import ConfirmDelete from "@/components/ConfirmDelete";

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--line)] bg-black/40 px-2 py-1.5 text-sm";

function FieldInput({
  field,
  value,
  skipRequired,
}: {
  field: Field;
  value?: unknown;
  skipRequired?: boolean;
}) {
  const dv = value == null ? "" : String(value);
  const required = field.required && !skipRequired;
  return (
    <label className="label block">
      {field.label}
      {field.type === "textarea" ? (
        <textarea name={field.name} defaultValue={dv} required={required} rows={3} className={inputClass} />
      ) : (
        <input
          name={field.name}
          type={field.type === "number" ? "number" : "text"}
          defaultValue={dv}
          required={required}
          className={inputClass}
        />
      )}
    </label>
  );
}

function Cell({ name, value }: { name: string; value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="c-dim">null</span>;
  }
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  if ((name === "url" || name === "image_url") && s.startsWith("http")) {
    return <img src={s} alt="" className="h-12 w-12 rounded object-cover" />;
  }
  return <span title={s}>{s.length > 80 ? s.slice(0, 80) + "…" : s}</span>;
}

export default async function ManagePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  await requireAdmin();

  const { table: slug } = await params;
  const cfg = TABLES[slug];
  if (!cfg) notFound();

  const { data: rows, error } = await adminDb()
    .from(cfg.table)
    .select("*")
    .order(cfg.orderBy ?? "created_at", { ascending: cfg.orderAsc ?? false })
    .limit(200);

  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];
  const readOnly = !cfg.canCreate && !cfg.canUpdate && !cfg.canDelete;
  const hasActions = cfg.canUpdate || cfg.canDelete;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">
          {cfg.title}
          <span className="cursor">_</span>
        </h1>
        <p className="page-sub">
          {rows?.length ?? 0} rows (latest 200){readOnly ? " · read-only" : ""}
        </p>
      </div>

      {error && (
        <p className="panel p-4 text-sm" style={{ color: "var(--bad)" }}>
          {error.message}
        </p>
      )}

      {cfg.canCreate && (
        <details className="panel">
          <summary className="panel-head cursor-pointer">
            <span className="label slashes">add new</span>
          </summary>
          <form action={createRow.bind(null, slug)} className="panel-body grid gap-3 sm:grid-cols-2">
            {cfg.fields.map((f) => (
              <FieldInput key={f.name} field={f} skipRequired={cfg.upload?.urlField === f.name} />
            ))}
            {cfg.upload && (
              <label className="label block">
                Upload image file
                <input type="file" name="file" accept="image/*" className="mt-1 block w-full text-sm" />
              </label>
            )}
            <div className="sm:col-span-2">
              <button type="submit" className="btn">
                $ create
              </button>
            </div>
          </form>
        </details>
      )}

      <div className="panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)]">
              {columns.map((c) => (
                <th key={c} className="label whitespace-nowrap px-3 py-2">
                  {c}
                </th>
              ))}
              {hasActions && <th className="label px-3 py-2">actions</th>}
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={String(row.id)} className="border-b border-[var(--line)] align-top last:border-0">
                {columns.map((c) => (
                  <td key={c} className="max-w-xs px-3 py-2">
                    <Cell name={c} value={row[c]} />
                  </td>
                ))}
                {hasActions && (
                  <td className="min-w-52 px-3 py-2">
                    <div className="flex flex-col gap-2">
                      {cfg.canUpdate && (
                        <details>
                          <summary className="cursor-pointer text-xs c-info">edit</summary>
                          <form action={updateRow.bind(null, slug)} className="mt-2 space-y-2">
                            <input type="hidden" name="id" value={String(row.id)} />
                            {cfg.fields.map((f) => (
                              <FieldInput key={f.name} field={f} value={row[f.name]} />
                            ))}
                            <button type="submit" className="btn btn-ghost">
                              $ save
                            </button>
                          </form>
                        </details>
                      )}
                      {cfg.canDelete && (
                        <form action={deleteRow.bind(null, slug)}>
                          <input type="hidden" name="id" value={String(row.id)} />
                          <ConfirmDelete />
                        </form>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows && rows.length === 0 && (
          <p className="px-3 py-6 text-center text-sm c-dim">No rows yet.</p>
        )}
      </div>
    </div>
  );
}