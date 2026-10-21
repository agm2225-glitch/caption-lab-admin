"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";

function fields(f: FormData) {
  const g = (k: string) => String(f.get(k) ?? "").trim() || null;
  return {
    image_url: g("image_url"),
    image_description: g("image_description"),
    caption_text: g("caption_text"),
    flavor: g("flavor"),
    context: g("context"),
  };
}

export async function saveCaption(f: FormData) {
  const user = await requireAdmin();
  const id = String(f.get("id") ?? "");
  const db = adminDb();
  const { error } = id
    ? await db.from("captions").update(fields(f)).eq("id", id)
    : await db.from("captions").insert({ ...fields(f), user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
  redirect("/admin/captions");
}

export async function deleteCaption(f: FormData) {
  await requireAdmin();
  const id = String(f.get("id") ?? "");
  const db = adminDb();
  await db.from("votes").delete().eq("caption_id", id); // avoid foreign-key errors
  const { error } = await db.from("captions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}