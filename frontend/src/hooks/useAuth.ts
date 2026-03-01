"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { verifyUserAfterLogin } from "@/app/actions/authApi";

export function useAuth(onAuthenticated?: () => void) {
  const [current_user_id, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();
  const callback_ref = useRef(onAuthenticated);

  useEffect(() => {
    callback_ref.current = onAuthenticated;
  });

  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await verifyUserAfterLogin(token);
        setCurrentUserId(res.data?.id ?? null);
      } catch (err) {
        console.error("User fetch error:", err);
      }

      callback_ref.current?.();
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (!auth) {
      router.push("/login");
      return;
    }
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return { current_user_id, handleLogout };
}
