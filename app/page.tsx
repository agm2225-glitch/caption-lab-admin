"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const error = useSearchParams().get("error");

  async function signIn() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }
  async function signOut() {
    await createClient().auth.signOut();
    location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-8">
      <div className="panel w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[0.72rem] text-[#666]">admin@caption-lab ~</span>
        </div>
        <div className="bg-[#0a0a0a] p-8">
          <div className="mb-1 text-[0.78rem] text-[#666]">$ ./authenticate.sh</div>
          <div className="mb-8 text-[0.78rem]">
            <span className="text-[#4ade80]">▶ </span>
            <span className="text-[#aaa]">Caption Lab Admin</span>
            <span className="text-[#666]"> v1.0.0</span>
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white">
            Access Required<span className="animate-pulse text-[#4ade80]">_</span>
          </h1>
          <p className="mb-6 text-[0.82rem] leading-relaxed text-[#666]">
            Superadmin credentials required.
            <br />
            Unauthorized access will be logged.
          </p>
          {error === "not_admin" && (
            <p className="mb-4 text-[0.8rem] text-[#ff5f57]">
              ✗ This account is not authorized for the admin area.
            </p>
          )}
          <button onClick={signIn} className="btn flex w-full items-center justify-center gap-2 py-3">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#4285f4]">
              G
            </span>
            $ sign_in --provider google
          </button>
          {error === "not_admin" && (
            <button onClick={signOut} className="mt-3 w-full text-[0.75rem] text-[#666] underline">
              sign out
            </button>
          )}
          <div className="mt-6 rounded-md border border-[#1e1e1e] bg-[#111] p-3">
            <div className="label mb-1">system note</div>
            <div className="text-[0.72rem] leading-relaxed text-[#555]">
              Only users with <span className="text-[#febc2e]">is_superadmin=TRUE</span> in the
              profiles table will be granted access.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}