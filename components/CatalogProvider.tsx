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
  const [genres, setGenres] = useState<NavGenre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/catalog/browse?lang=en&sectionLimit=1", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (Array.isArray(data?.categories)) {
          setCategories(data.categories);
        }
        if (Array.isArray(data?.genres)) {
          setGenres(data.genres);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <CatalogNavContext.Provider value={{ categories, genres, loading }}>
      {children}
    </CatalogNavContext.Provider>
  );
}
