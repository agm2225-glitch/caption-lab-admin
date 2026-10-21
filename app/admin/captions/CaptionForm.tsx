import Link from "next/link";
import { saveCaption } from "./actions";

const FIELDS = [
  ["image_url", "Image URL"],
  ["image_description", "Image description"],
  ["caption_text", "Caption text"],
  ["flavor", "Flavor"],
  ["context", "Context"],
] as const;

type Caption = { id?: string } & Partial<Record<(typeof FIELDS)[number][0], string | null>>;

export default function CaptionForm({ caption }: { caption?: Caption }) {
  return (
    <form action={saveCaption} className="panel max-w-2xl">
      <div className="panel-head">
        <span className="label slashes">{caption?.id ? "edit record" : "new record"}</span>
        {caption?.id && <span className="mono text-sm c-dim">{caption.id.slice(0, 8)}</span>}
      </div>
      <div className="panel-body flex flex-col gap-5">
        {caption?.id && <input type="hidden" name="id" value={caption.id} />}
        {FIELDS.map(([k, label]) => (
          <label key={k} className="flex flex-col gap-1.5">
            <span className="label">{label}</span>
            <input name={k} defaultValue={caption?.[k] ?? ""} className="input" />
          </label>
        ))}
        <div className="flex gap-3">
          <button className="btn">$ save</button>
          <Link href="/admin/captions" className="btn btn-ghost">cancel</Link>
        </div>
      </div>
    </form>
  );
}