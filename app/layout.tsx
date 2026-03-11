import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import GlobalNav from "../components/GlobalNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <GlobalNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
