"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

type SubscribeButtonProps = {
  channelHandle: string;
  initialSubscribed?: boolean;
  onSubscriptionChange?: (subscribed: boolean) => void;
};

export default function SubscribeButton({
  channelHandle,
  initialSubscribed = false,
  onSubscriptionChange,
}: SubscribeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const handleClick = async () => {
    if (!user) {
      router.push(`/login?next=/channels/${channelHandle}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${channelHandle}/subscribe`, {
        method: subscribed ? "DELETE" : "POST",
        credentials: "include",
      });
      if (res.ok) {
        const next = !subscribed;
        setSubscribed(next);
        onSubscriptionChange?.(next);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        style={{
          padding: "8px 24px",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: "var(--r-sm)",
          opacity: 0.6,
          cursor: "not-allowed",
        }}
        className="btn-grad"
      >
        ...
      </button>
    );
  }

  if (subscribed) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: "8px 24px",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: "var(--r-sm)",
          background: "transparent",
          border: `1px solid ${hover ? "var(--accent3)" : "var(--line)"}`,
          color: hover ? "var(--accent3)" : "var(--text)",
          cursor: "pointer",
          transition: "color 0.15s, border-color 0.15s",
        }}
      >
        {hover ? "구독 해제" : "구독중"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="btn-grad"
      style={{
        padding: "8px 24px",
        fontSize: 14,
        fontWeight: 600,
        borderRadius: "var(--r-sm)",
        cursor: "pointer",
      }}
    >
      구독
    </button>
  );
}
