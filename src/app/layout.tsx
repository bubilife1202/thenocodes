import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "더노코즈 - AI 시대의 실무 챌린지 커뮤니티",
  description: "AI와 노코드로 실무 문제를 해결하고 함께 성장하는 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-[#FDFBF7] text-[#3F3F46] antialiased`}>
        <Header />
        <div className="mx-auto max-w-[1440px] flex">
          {/* Left Sidebar - Fixed on Desktop */}
          <aside className="hidden md:block w-64 shrink-0 border-r border-black/[0.04] h-[calc(100vh-64px)] sticky top-16 overflow-y-auto p-6">
            <Sidebar />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 min-h-screen bg-[#FDFBF7]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
