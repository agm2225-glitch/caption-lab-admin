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
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="panel w-full max-w-lg overflow-hidden">
        <div className="panel-head">
          <span className="label slashes">secure terminal</span>
          <span className="mono flex items-center gap-2 text-sm c-dim">
            <span className="dot" /> online
          </span>
        </div>
        <div className="panel-body p-8">
          <div className="mono space-y-1 text-sm c-dim">
            <div>$ boot caption-lab --admin</div>
            <div><span className="c-accent">[ok]</span> connecting to database</div>
            <div><span className="c-accent">[ok]</span> auth provider: google</div>
            <div><span className="c-warn">[!!]</span> credentials required</div>
          </div>

          <h1 className="mt-8 text-3xl font-semibold text-white">
            Access required<span className="cursor">_</span>
          </h1>
          <p className="mt-2 text-base c-dim">
            Only superadmins can enter. Everything else gets bounced.
          </p>

          {error === "not_admin" && (
            <div className="mono mt-5 rounded border border-[#5a2630] bg-[rgba(255,93,115,0.08)] p-3 text-sm c-bad">
              ✗ ACCESS DENIED: this account is not a superadmin.
            </div>
          )}

          <button onClick={signIn} className="btn mt-6 flex w-full items-center justify-center gap-3 py-3">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]">
              G
            </span>
            $ sign_in --provider google
          </button>

          {error === "not_admin" && (
            <button onClick={signOut} className="mono mt-3 w-full text-sm c-dim underline">
              sign out and try another account
            </button>
          )}
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