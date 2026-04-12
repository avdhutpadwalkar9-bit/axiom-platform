"use client";

import ReactMarkdown from "react-markdown";

interface AIChatBubbleProps {
  role: "user" | "ai";
  text: string;
}

/**
 * Clean up AI response text so ReactMarkdown can parse it properly.
 * Fixes common issues with bullet chars, spacing, and inline lists.
 */
function cleanMarkdown(raw: string): string {
  let text = raw;

  // Replace unicode bullets (•, ◦, ▪, ▸) with markdown dashes
  text = text.replace(/^[•◦▪▸]\s*/gm, "- ");

  // Fix bullets that appear mid-line (inline lists) — split them onto new lines
  // e.g. "text • item1 • item2" → "text\n- item1\n- item2"
  text = text.replace(/\s+[•◦▪▸]\s+/g, "\n- ");

  // Ensure blank line before headers so markdown parses them
  text = text.replace(/([^\n])\n(#{1,3}\s)/g, "$1\n\n$2");

  // Ensure blank line before list items that follow a paragraph
  text = text.replace(/([^\n-])\n(- )/g, "$1\n\n$2");

  // Fix numbered lists that use "1." mid-paragraph
  text = text.replace(/([^\n])\n(\d+\.\s)/g, "$1\n\n$2");

  return text;
}

export default function AIChatBubble({ role, text }: AIChatBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-50 text-[#1a1a1a] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-line">
          {text}
        </div>
      </div>
    );
  }

  const cleaned = cleanMarkdown(text);

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#f5f5f5] px-5 py-4 ai-message">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-[15px] font-bold text-[#1a1a1a] mt-4 mb-2 first:mt-0">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-[14px] font-bold text-[#1a1a1a] mt-4 mb-2 first:mt-0">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-[13px] font-semibold text-[#1a1a1a] mt-3 mb-1.5 first:mt-0">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-[13px] text-[#333] leading-[1.75] mb-3 last:mb-0">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-3 pl-4 space-y-1.5 list-none">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 pl-5 space-y-1.5 list-decimal marker:text-[#999] marker:text-[12px]">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-[13px] text-[#333] leading-[1.65] relative pl-3">
                <span className="absolute left-0 top-[7px] w-1 h-1 rounded-full bg-[#999]" />
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-[#1a1a1a]">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-[#555]">{children}</em>
            ),
            code: ({ children }) => (
              <code className="bg-[#e8e8e8] text-[#1a1a1a] px-1.5 py-0.5 rounded text-[12px] font-mono">{children}</code>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-[12px]">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#fafafa]">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="text-left px-3 py-2 font-semibold text-[#1a1a1a] border-b border-[#e5e5e5]">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-[#444] border-b border-[#f0f0f0]">{children}</td>
            ),
            hr: () => (
              <hr className="my-4 border-[#e5e5e5]" />
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-emerald-300 pl-3 my-3 text-[#555] italic text-[13px]">{children}</blockquote>
            ),
          }}
        >
          {cleaned}
        </ReactMarkdown>
      </div>
    </div>
  );
}
