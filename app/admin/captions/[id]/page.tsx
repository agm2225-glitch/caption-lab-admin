import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";
import CaptionForm from "../CaptionForm";

export default async function EditCaption({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { data } = await adminDb().from("captions").select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <div>
      <h1 className="page-title mb-6">Edit caption<span className="cursor">_</span></h1>
      <CaptionForm caption={data} />
    </div>
  );
}