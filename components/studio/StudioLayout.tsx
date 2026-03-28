"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { Channel } from "@/types/channel";
import StudioHeader from "./StudioHeader";
import StudioSidebar from "./StudioSidebar";
import StudioMobileNav from "./StudioMobileNav";

// ─── Context ────────────────────────────────────────────────────────────────

type StudioContextValue = {
  channel: Channel | null;
  loading: boolean;
  refetchChannel: () => void;
};

const StudioContext = createContext<StudioContextValue>({
  channel: null,
  loading: true,
  refetchChannel: () => {},
});

export function useStudio() {
  return useContext(StudioContext);
}

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChannel = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/creator/channel?lang=${locale}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setChannel(data);
      } else {
        setChannel(null);
      }
    } catch {
      setChannel(null);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  return (
    <StudioContext.Provider
      value={{ channel, loading, refetchChannel: fetchChannel }}
    >
      {/* Responsive styles */}
      <style>{`
        .studio-mobile-nav-wrap { display: none; }
        @media (max-width: 768px) {
          .studio-sidebar-wrap { display: none !important; }
          .studio-mobile-nav-wrap {
            display: block;
            position: sticky;
            top: 56px;
            z-index: 40;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <StudioHeader channel={channel} />

        <div className="studio-mobile-nav-wrap">
          <StudioMobileNav />
        </div>

        <div style={{ display: "flex", flex: 1 }}>
          <div className="studio-sidebar-wrap">
            <StudioSidebar />
          </div>

          <main
            style={{
              flex: 1,
              padding: "28px 32px",
              maxWidth: 1080,
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </StudioContext.Provider>
  );
}
