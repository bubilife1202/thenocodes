"use client";

// Simple markdown renderer — can be replaced with react-markdown later
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose max-w-none prose-headings:text-[#3F3F46] prose-a:text-[#14B8A6] prose-code:text-[#14B8A6]">
      {/* For MVP, render as pre-wrapped text. Replace with react-markdown later */}
      <div className="whitespace-pre-wrap text-[#71717A] leading-relaxed">
        {content}
      </div>
    </div>
  );
}
