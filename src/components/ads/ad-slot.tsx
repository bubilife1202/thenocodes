"use client";

type AdSlotProps = {
  slot: "leaderboard-sidebar" | "blog-inline" | "challenge-complete" | "feed-native";
  className?: string;
};

export function AdSlot({ slot, className = "" }: AdSlotProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium tracking-widest text-[#A1A1AA] uppercase">
        ad
      </span>
      {/* Skeleton placeholder — replace with real ad SDK */}
      <div className="mt-3 space-y-2">
        <div className="h-3 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="mt-3 h-8 w-24 rounded-lg bg-gray-50" />
      </div>
    </div>
  );
}

export function NativeAd({ title, description, cta, ctaUrl, sponsor }: {
  title: string;
  description: string;
  cta: string;
  ctaUrl: string;
  sponsor: string;
}) {
  return (
    <a
      href={ctaUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-amber-300 transition-colors md:grid-cols-[1fr_auto] items-center shadow-sm"
    >
      <div>
        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium tracking-widest text-amber-600 uppercase mb-3">
          {sponsor}
        </span>
        <h3 className="text-[#3F3F46] font-semibold">{title}</h3>
        <p className="text-sm text-[#71717A] mt-1">{description}</p>
      </div>
      <span className="text-sm text-amber-600 font-medium group-hover:translate-x-1 transition-transform">
        {cta} →
      </span>
    </a>
  );
}
