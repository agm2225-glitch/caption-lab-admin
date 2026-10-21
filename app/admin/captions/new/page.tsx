import { requireAdmin } from "@/lib/requireAdmin";
import CaptionForm from "../CaptionForm";

export default async function NewCaption() {
  await requireAdmin();
  return (
    <div>
      <h1 className="page-title mb-6">New caption<span className="cursor">_</span></h1>
      <CaptionForm />
    </div>
  );
}