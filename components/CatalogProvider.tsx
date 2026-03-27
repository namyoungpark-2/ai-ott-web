"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type NavCategory = {
  slug: string;
  label: string;
  tier?: number;
  parentSlug?: string | null;
};

export type NavGenre = {
  slug: string;
  label: string;
};

type CatalogNavContextValue = {
  categories: NavCategory[];
  genres: NavGenre[];
  loading: boolean;
};

const CatalogNavContext = createContext<CatalogNavContextValue>({
  categories: [],
  genres: [],
  loading: true,
});

export function useCatalogNav() {
  return useContext(CatalogNavContext);
}

export function CatalogNavProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/catalog/browse?lang=en&sectionLimit=1", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        // 백엔드 응답: { sections: [{ category, items }] }
        // sections에서 고유 카테고리를 추출
        if (Array.isArray(data?.sections)) {
          const seen = new Set<string>();
          const cats: NavCategory[] = [];
          for (const section of data.sections) {
            const cat = section.category;
            if (typeof cat === "string" && cat && !seen.has(cat)) {
              seen.add(cat);
              cats.push({ slug: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) });
            }
          }
          setCategories(cats);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <CatalogNavContext.Provider value={{ categories, genres: [], loading }}>
      {children}
    </CatalogNavContext.Provider>
  );
}
