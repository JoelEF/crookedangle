import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Trading Tracker Pro",
  description: "Professionele trading tracker met AI-analyse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen" style={{ background: "#0a0e1a" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
