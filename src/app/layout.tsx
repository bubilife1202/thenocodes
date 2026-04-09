import type { Metadata } from "next";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "더노코즈 - No Code, Only Action",
  description: "한국 AI 해커톤, 공모전, 밋업을 매일 자동으로 모아둡니다. 실행하는 메이커들의 아지트.",
  openGraph: {
    title: "더노코즈 - No Code, Only Action",
    description: "한국 AI 해커톤, 공모전, 밋업을 매일 자동 수집. 마감 놓치지 마세요.",
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
