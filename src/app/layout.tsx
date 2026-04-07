import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "더노코즈 - AI & 노코드 커뮤니티",
  description: "해커톤, 공모전, 팀 모집까지. AI와 노코드로 만드는 사람들의 커뮤니티.",
  openGraph: {
    title: "더노코즈 - AI & 노코드 커뮤니티",
    description: "한국 해커톤, AI 경진대회, 공모전 정보를 한눈에",
    siteName: "더노코즈",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-pretendard bg-[#FAFAF9] text-[#18181B] antialiased">
        <Sidebar />
        <div className="lg:ml-56 flex flex-col min-h-screen pt-12 lg:pt-0">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
