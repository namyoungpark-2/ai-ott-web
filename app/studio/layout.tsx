import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "크리에이터 스튜디오 | AI OTT",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
