"use client";

import { supabase } from "@/lib/supabase";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    };

    checkSession();
  }, []);
   
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return(
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={signInWithGoogle}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Sign in with Google
      </button>
    </div>
  )
}