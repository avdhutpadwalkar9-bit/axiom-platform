"use client";

import ReactMarkdown from "react-markdown";

interface AIChatBubbleProps {
  role: "user" | "ai";
  text: string;
}

export default function AIChatBubble({ role, text }: AIChatBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-50 text-[#1a1a1a] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#f5f5f5] px-4 py-3 text-sm leading-relaxed ai-response">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-base font-bold text-[#1a1a1a] mt-3 mb-2 first:mt-0">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-[13px] font-bold text-[#1a1a1a] mt-3 mb-1.5 first:mt-0">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-[13px] font-semibold text-[#1a1a1a] mt-2.5 mb-1 first:mt-0">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-[13px] text-[#333] leading-[1.7] mb-2 last:mb-0">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-2 pl-1 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-2 pl-4 space-y-1 list-decimal">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-[13px] text-[#333] leading-[1.6] flex items-start gap-1.5">
                <span className="text-emerald-500 mt-1.5 text-[8px] leading-none flex-shrink-0">●</span>
                <span>{children}</span>
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
              <div className="overflow-x-auto my-2 rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-xs">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#fafafa]">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="text-left p-2 font-semibold text-[#1a1a1a] border-b border-[#e5e5e5]">{children}</th>
            ),
            td: ({ children }) => (
              <td className="p-2 text-[#444] border-b border-[#f0f0f0]">{children}</td>
            ),
            hr: () => (
              <hr className="my-3 border-[#e5e5e5]" />
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-emerald-300 pl-3 my-2 text-[#555] italic">{children}</blockquote>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
