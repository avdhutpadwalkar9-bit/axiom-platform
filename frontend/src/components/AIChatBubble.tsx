"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIChatBubbleProps {
  role: "user" | "ai";
  text: string;
  dark?: boolean;
}

function cleanMarkdown(raw: string): string {
  let text = raw;
  text = text.replace(/^[•◦▪▸]\s*/gm, "- ");
  text = text.replace(/\s+[•◦▪▸]\s+/g, "\n- ");
  text = text.replace(/([^\n])\n(#{1,3}\s)/g, "$1\n\n$2");
  text = text.replace(/([^\n-])\n(- )/g, "$1\n\n$2");
  text = text.replace(/([^\n])\n(\d+\.\s)/g, "$1\n\n$2");
  return text;
}

export default function AIChatBubble({ role, text, dark = false }: AIChatBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className={`max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${
          dark ? "bg-emerald-500/20 text-white" : "bg-emerald-50 text-[#1a1a1a]"
        }`}>
          {text}
        </div>
      </div>
    );
  }

  const cleaned = cleanMarkdown(text);
  const textColor = dark ? "text-white/80" : "text-[#333]";
  const textColorStrong = dark ? "text-white" : "text-[#1a1a1a]";
  const textColorMuted = dark ? "text-white/40" : "text-[#999]";
  const bgBubble = dark ? "bg-white/5" : "bg-[#f5f5f5]";
  const borderColor = dark ? "border-white/10" : "border-[#e5e5e5]";
  const bgHeader = dark ? "bg-white/5" : "bg-[#fafafa]";
  const bgCode = dark ? "bg-white/10 text-emerald-300" : "bg-[#e8e8e8] text-[#1a1a1a]";

  return (
    <div className="flex justify-start">
      <div className={`max-w-[90%] rounded-2xl rounded-bl-sm px-5 py-4 ${bgBubble}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className={`text-[15px] font-bold ${textColorStrong} mt-4 mb-2 first:mt-0`}>{children}</h1>,
            h2: ({ children }) => <h2 className={`text-[14px] font-bold ${textColorStrong} mt-4 mb-2 first:mt-0`}>{children}</h2>,
            h3: ({ children }) => <h3 className={`text-[13px] font-semibold ${textColorStrong} mt-3 mb-1.5 first:mt-0`}>{children}</h3>,
            p: ({ children }) => <p className={`text-[13px] ${textColor} leading-[1.75] mb-3 last:mb-0`}>{children}</p>,
            ul: ({ children }) => <ul className="mb-3 pl-4 space-y-1.5 list-none">{children}</ul>,
            ol: ({ children }) => <ol className={`mb-3 pl-5 space-y-1.5 list-decimal marker:${textColorMuted} marker:text-[12px]`}>{children}</ol>,
            li: ({ children }) => (
              <li className={`text-[13px] ${textColor} leading-[1.65] relative pl-3`}>
                <span className={`absolute left-0 top-[7px] w-1 h-1 rounded-full ${dark ? "bg-emerald-400" : "bg-[#999]"}`} />
                {children}
              </li>
            ),
            strong: ({ children }) => <strong className={`font-semibold ${textColorStrong}`}>{children}</strong>,
            em: ({ children }) => <em className={`italic ${dark ? "text-white/50" : "text-[#555]"}`}>{children}</em>,
            code: ({ children }) => <code className={`${bgCode} px-1.5 py-0.5 rounded text-[12px] font-mono`}>{children}</code>,
            table: ({ children }) => <div className={`overflow-x-auto my-3 rounded-lg border ${borderColor}`}><table className="w-full text-[12px]">{children}</table></div>,
            thead: ({ children }) => <thead className={bgHeader}>{children}</thead>,
            th: ({ children }) => <th className={`text-left px-3 py-2 font-semibold ${textColorStrong} border-b ${borderColor}`}>{children}</th>,
            td: ({ children }) => <td className={`px-3 py-2 ${textColor} border-b ${dark ? "border-white/5" : "border-[#f0f0f0]"}`}>{children}</td>,
            hr: () => <hr className={`my-4 ${borderColor}`} />,
            a: ({ children, href }) => <a href={href} className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            blockquote: ({ children }) => <blockquote className={`border-l-2 border-emerald-400/50 pl-3 my-3 ${dark ? "text-white/40" : "text-[#555]"} italic text-[13px]`}>{children}</blockquote>,
          }}
        >
          {cleaned}
        </ReactMarkdown>
      </div>
    </div>
  );
}
