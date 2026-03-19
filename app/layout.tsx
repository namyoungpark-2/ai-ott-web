import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../components/AuthProvider";
import GlobalNav from "../components/GlobalNav";
import CookieConsent from "../components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body>
        <AuthProvider>
          <GlobalNav />
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
