import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../components/AuthProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import { CatalogNavProvider } from "../components/CatalogProvider";
import GlobalNav from "../components/GlobalNav";
import CookieConsent from "../components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CatalogNavProvider>
              <GlobalNav />
              {children}
              <CookieConsent />
            </CatalogNavProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
