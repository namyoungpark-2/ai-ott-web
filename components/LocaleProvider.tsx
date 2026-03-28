"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Supported locales ──────────────────────────────────────────────────────

export type Locale = "ko" | "en";

export const SUPPORTED_LOCALES: { code: Locale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
];

const DEFAULT_LOCALE: Locale = "ko";
const STORAGE_KEY = "ott_locale";

// ─── Translations ───────────────────────────────────────────────────────────

const messages: Record<Locale, Record<string, string>> = {
  ko: {
    "nav.home": "홈",
    "nav.channels": "채널",
    "nav.search": "검색",
    "nav.start": "시작하기",
    "nav.logout": "로그아웃",
    "common.loadMore": "더 보기",
    "common.loading": "불러오는 중...",
    "common.retry": "다시 시도",
    "common.save": "저장",
    "common.cancel": "취소",
    "common.delete": "삭제",
    "common.edit": "수정",
    "common.subscribe": "구독",
    "common.subscribed": "구독중",
    "common.unsubscribe": "구독 해제",
    "common.subscribers": "구독자",
    "common.episodes": "개 에피소드",
    "common.contents": "개 콘텐츠",
    "common.play": "▶ 재생",
    "common.addToList": "+ 찜하기",
    "common.inList": "✓ 찜됨",
    "search.placeholder": "영화, 시리즈, 태그 검색…",
    "search.noResults": "에 대한 결과가 없습니다.",
    "channel.explore": "채널 탐색",
    "channel.exploreDesc": "다양한 크리에이터의 채널을 찾아보세요.",
    "channel.noChannels": "등록된 채널이 없습니다.",
    "channel.official": "공식 채널",
    "channel.noContents": "등록된 콘텐츠가 없습니다.",
    "channel.noSeries": "등록된 시리즈가 없습니다.",
    "channel.tab.contents": "영상",
    "channel.tab.series": "시리즈",
    "channel.loadError": "채널을 불러올 수 없습니다.",
    "channel.contentsError": "콘텐츠를 불러올 수 없습니다.",
    "channel.seriesError": "시리즈를 불러올 수 없습니다.",
    "studio.title": "크리에이터 스튜디오",
    "studio.viewChannel": "채널 보기",
    "studio.dashboard": "대시보드",
    "studio.channelSettings": "채널 설정",
    "studio.myContents": "내 콘텐츠",
    "studio.series": "시리즈",
    "studio.newContent": "새 콘텐츠",
    "home.continueWatching": "이어보기",
    "home.noContents": "등록된 콘텐츠가 없습니다.",
    "home.fetchError": "콘텐츠를 불러올 수 없습니다.",
    "home.sectionError": "섹션 데이터를 불러오지 못했습니다.",
    "content.notFound": "콘텐츠를 찾을 수 없습니다.",
    "content.loadError": "콘텐츠 정보를 불러올 수 없습니다.",
    "content.goHome": "홈으로 돌아가기",
    "content.relatedContents": "관련 콘텐츠",
    "content.category": "카테고리",
    "content.tags": "태그",
    "error.serverConnection": "서버 연결을 확인하거나 잠시 후 다시 시도해 주세요.",
  },
  en: {
    "nav.home": "Home",
    "nav.channels": "Channels",
    "nav.search": "Search",
    "nav.start": "Get Started",
    "nav.logout": "Logout",
    "common.loadMore": "Load More",
    "common.loading": "Loading...",
    "common.retry": "Retry",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.subscribe": "Subscribe",
    "common.subscribed": "Subscribed",
    "common.unsubscribe": "Unsubscribe",
    "common.subscribers": "subscribers",
    "common.episodes": " episodes",
    "common.contents": " contents",
    "common.play": "▶ Play",
    "common.addToList": "+ Add to List",
    "common.inList": "✓ In List",
    "search.placeholder": "Search movies, series, tags…",
    "search.noResults": "No results for ",
    "channel.explore": "Explore Channels",
    "channel.exploreDesc": "Discover channels from various creators.",
    "channel.noChannels": "No channels found.",
    "channel.official": "Official Channel",
    "channel.noContents": "No contents available.",
    "channel.noSeries": "No series available.",
    "channel.tab.contents": "Videos",
    "channel.tab.series": "Series",
    "channel.loadError": "Failed to load channel.",
    "channel.contentsError": "Failed to load contents.",
    "channel.seriesError": "Failed to load series.",
    "studio.title": "Creator Studio",
    "studio.viewChannel": "View Channel",
    "studio.dashboard": "Dashboard",
    "studio.channelSettings": "Channel Settings",
    "studio.myContents": "My Contents",
    "studio.series": "Series",
    "studio.newContent": "New Content",
    "home.continueWatching": "Continue Watching",
    "home.noContents": "No contents available.",
    "home.fetchError": "Failed to load contents.",
    "home.sectionError": "Failed to load section data.",
    "content.notFound": "Content not found.",
    "content.loadError": "Failed to load content info.",
    "content.goHome": "Go Home",
    "content.relatedContents": "Related Contents",
    "content.category": "Category",
    "content.tags": "Tags",
    "error.serverConnection": "Check server connection or try again later.",
  },
};

// ─── Context ────────────────────────────────────────────────────────────────

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
});

export function useLocale() {
  return useContext(LocaleContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const browserLang = navigator.language?.split("-")[0];
  if (browserLang === "en") return "en";
  return DEFAULT_LOCALE; // default ko
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === "ko" || stored === "en")) {
      setLocaleState(stored);
    } else {
      const detected = detectBrowserLocale();
      setLocaleState(detected);
      localStorage.setItem(STORAGE_KEY, detected);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return messages[locale]?.[key] ?? messages[DEFAULT_LOCALE]?.[key] ?? key;
    },
    [locale],
  );

  // Update html lang attribute
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
