import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import Nav from "./Nav";

async function signOut() {
  "use server";
  await (await createClient()).auth.signOut();
  redirect("/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="flex min-h-screen">
        <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-8 overflow-y-auto border-r border-[var(--line)] bg-[rgba(5,8,9,0.85)] p-5">        <div>
          <div className="mono text-lg font-semibold text-white">
            <span className="c-accent">▌</span>CAPTION_LAB
          </div>
          <div className="label mt-1">admin console v1.0</div>
        </div>
        <Nav />
        <div className="mt-auto flex flex-col gap-3">
          <div>
            <div className="label flex items-center gap-2">
              <span className="dot" /> session
            </div>
            <div className="mono mt-1 truncate text-sm">{user.email}</div>
          </div>
          <form action={signOut}>
            <button className="btn btn-ghost w-full">$ sign_out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <div className="mono mb-8 text-sm c-dim">
          root@caption-lab:<span className="c-info">~/admin</span>$ <span className="cursor">█</span>
        </div>
        {children}
      </main>
    </div>
  );
}