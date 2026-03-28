"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscribedHandles, setSubscribedHandles] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubscribedHandles(new Set());
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetch("/api/me/subscriptions?lang=ko", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json();
        const handles = Array.isArray(data)
          ? data.map((s: { handle: string }) => s.handle)
          : [];
        setSubscribedHandles(new Set(handles));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isSubscribed = useCallback(
    (handle: string) => subscribedHandles.has(handle),
    [subscribedHandles]
  );

  const updateSubscription = useCallback(
    (handle: string, subscribed: boolean) => {
      setSubscribedHandles((prev) => {
        const next = new Set(prev);
        if (subscribed) next.add(handle);
        else next.delete(handle);
        return next;
      });
    },
    []
  );

  return { subscribedHandles, isSubscribed, updateSubscription, loaded };
}
