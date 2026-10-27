"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";
import { adminDb } from "@/lib/supabase/admin";
import { TABLES, type TableConfig } from "@/lib/tables";

function getConfig(slug: string): TableConfig {
  const cfg = TABLES[slug];
  if (!cfg) throw new Error("Unknown table");
  return cfg;
}

function readValues(cfg: TableConfig, formData: FormData, mode: "create" | "update") {
  const values: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    const raw = String(formData.get(f.name) ?? "").trim();
    if (raw === "") {
      const uploadFills = mode === "create" && cfg.upload?.urlField === f.name;
      if (f.required && !uploadFills) throw new Error(`${f.label} is required`);
      if (mode === "update") values[f.name] = null;
      continue;
    }
    if (f.type === "number") {
      const n = Number(raw);
      if (Number.isNaN(n)) throw new Error(`${f.label} must be a number`);
      values[f.name] = n;
    } else {
      values[f.name] = raw;
    }
  }
  return values;
}

export async function createRow(slug: string, formData: FormData) {
  await requireAdmin();
  const cfg = getConfig(slug);
  if (!cfg.canCreate) throw new Error("Create not allowed");
  const db = adminDb();

  const values = readValues(cfg, formData, "create");

  if (cfg.upload) {
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `admin/${Date.now()}-${safeName}`;
      const { error: uploadError } = await db.storage
        .from(cfg.upload.bucket)
        .upload(path, await file.arrayBuffer(), { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = db.storage.from(cfg.upload.bucket).getPublicUrl(path);
      values[cfg.upload.urlField] = data.publicUrl;
    }
    if (!values[cfg.upload.urlField]) {
      throw new Error("Upload a file or provide a URL");
    }
  }

  const { error } = await db.from(cfg.table).insert(values);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/manage/${slug}`);
}

export async function updateRow(slug: string, formData: FormData) {
  await requireAdmin();
  const cfg = getConfig(slug);
  if (!cfg.canUpdate) throw new Error("Update not allowed");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const values = readValues(cfg, formData, "update");
  const { error } = await adminDb().from(cfg.table).update(values).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/manage/${slug}`);
}

export async function deleteRow(slug: string, formData: FormData) {
  await requireAdmin();
  const cfg = getConfig(slug);
  if (!cfg.canDelete) throw new Error("Delete not allowed");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const { error } = await adminDb().from(cfg.table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/manage/${slug}`);
}