import type { Metadata } from "next";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "더노코즈 - AI & 노코드 커뮤니티",
  description: "해커톤, 공모전, 비즈니스 문제까지. AI와 노코드로 만드는 사람들의 커뮤니티.",
  openGraph: {
    title: "더노코즈 - AI & 노코드 커뮤니티",
    description: "한국 해커톤, AI 경진대회, 공모전, 비즈니스 문제를 한눈에",
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
      <body className="font-pretendard bg-[#FCFBF8] text-[#18181B] antialiased">
        <div className="min-h-screen lg:grid lg:grid-cols-[288px_minmax(0,1fr)] lg:items-start">
          <SiteNavigation />
          <div className="min-w-0 flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
