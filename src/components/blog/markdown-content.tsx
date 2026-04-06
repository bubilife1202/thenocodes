"use client";

// Simple markdown renderer — can be replaced with react-markdown later
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-indigo-400 prose-code:text-indigo-300">
      {/* For MVP, render as pre-wrapped text. Replace with react-markdown later */}
      <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
        {content}
      </div>
    </div>
  );
}
