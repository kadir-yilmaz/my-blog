"use client";

import { useState, useRef } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "code" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Kopyalama hatası:", err);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".code-block-copy-btn")) {
      return;
    }

    const selection = window.getSelection();
    if (selection && codeRef.current) {
      const range = document.createRange();
      range.selectNodeContents(codeRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Clean empty lines at start/end
  const cleanCode = code.replace(/^\s*\n/, "").replace(/\n\s*$/, "");

  return (
    <div className="code-block-container relative my-6 rounded-xl border border-white/10 bg-[#0d1117] shadow-lg group">
      {/* Header Bar - Sticky below main nav bar */}
      <div
        className="code-block-header sticky top-16 z-20 flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10 text-xs font-mono text-slate-400 select-none cursor-pointer rounded-t-xl"
        onDoubleClick={handleSelectAll}
      >
        <span className="font-medium lowercase tracking-wide text-slate-300">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`code-block-copy-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            copied ? "text-emerald-400 bg-emerald-950/40" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
          }`}
          title="Kodu Kopyala"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Kopyalandı!</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Area */}
      <pre className="!m-0 !pt-3 !pb-4 !px-4 !bg-transparent !border-none !rounded-none !rounded-b-xl overflow-x-auto block !select-text !cursor-text text-sm font-mono text-slate-50">
        <code ref={codeRef} className="!block !select-text !cursor-text">
          {cleanCode}
        </code>
      </pre>
    </div>
  );
}
