"use client";

import { useEffect } from "react";

export function CodeCopyListener() {
  useEffect(() => {
    // 🎓 Kod blokları için üst başlık çubuğu (Header Bar) ve kopyalama butonu
    const formatCodeBlocks = () => {
      const pres = document.querySelectorAll("pre");

      pres.forEach((pre) => {
        // Eğer zaten container ile sarmalanmışsa veya React CodeBlock bileşeni içindeyse atla
        if (pre.closest('.code-block-container')) {
          return;
        }

        // 🚨 ÇOK ÖNEMLİ: Eğer bu pre etiketi aktif bir editörün (Admin Paneli) içindeyse DOKUNMA!
        // ProseMirror/BlockNote DOM'una dışarıdan müdahale etmek, editörün metin seçimini (text selection)
        // ve imleç takibini tamamen bozar.
        if (pre.closest('.codex-editor') || pre.closest('.editorjs-wrapper') || pre.closest('.ProseMirror') || pre.closest('.bn-editor') || pre.isContentEditable) {
          return;
        }

        // Dil adını tespit et
        const codeEl = pre.querySelector("code") || pre;
        let language = "code";

        const langMatch = Array.from(codeEl.classList)
          .find((c) => c.startsWith("language-"))
          ?.replace("language-", "");

        if (langMatch) {
          language = langMatch;
        } else if (codeEl.getAttribute("data-language")) {
          language = codeEl.getAttribute("data-language") || "code";
        }

        // 1. DÜZELTME: BOŞLUKLAR (Üst ve alt gereksiz boşlukları temizle)
        // Sadece başındaki ve sonundaki "yeni satırları" sileriz, girintileri (indentation) bozmayız.
        if (codeEl.innerHTML) {
          codeEl.innerHTML = codeEl.innerHTML.replace(/^\s*\n/, "").replace(/\n\s*$/, "");
        }

        // Ana Kod Bloğu Container'ı
        // Tailwind ile tam stil: relative, margin-y, yuvarlak köşeler, arka plan, gölge
        const container = document.createElement("div");
        container.className = "code-block-container relative my-6 rounded-xl border border-white/10 bg-[#0d1117] shadow-lg group";
        container.setAttribute("title", "Tüm kodu seçmek için çift tıklayın");

        // 2. DÜZELTME: KOPYALA BUTONUNUN KAYBOLMASI
        // Üst Başlık Çubuğu (Header Bar)
        const header = document.createElement("div");
        header.className = "code-block-header sticky top-[4.25rem] z-30 flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10 text-xs font-mono text-slate-400 select-none rounded-t-xl cursor-pointer";
        header.setAttribute("title", "Tüm kodu seçmek için çift tıklayın");

        // Sol taraf: Dil Adı
        const langSpan = document.createElement("span");
        langSpan.className = "font-medium lowercase tracking-wide text-slate-300 flex items-center gap-2";
        langSpan.innerHTML = `
          <span>${language}</span>
          <span class="text-[10px] text-slate-500 font-normal hidden sm:inline">(çift tıkla: tümünü seç)</span>
        `;

        // Sağ taraf: Kopyalama Butonu
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "code-block-copy-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all";
        btn.setAttribute("title", "Kodu Kopyala");
        btn.innerHTML = `
          <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <svg class="check-icon hidden" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="btn-text">Kopyala</span>
        `;

        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.preventDefault();

          const clone = codeEl.cloneNode(true) as HTMLElement;
          clone.querySelectorAll(".code-block-copy-btn, select, [contenteditable='false']").forEach((n) => n.remove());
          const textToCopy = (clone.textContent || "").trim();

          if (!textToCopy) return;

          try {
            await navigator.clipboard.writeText(textToCopy);
            btn.classList.add("text-emerald-400");
            const copyIcon = btn.querySelector(".copy-icon");
            const checkIcon = btn.querySelector(".check-icon");
            const btnText = btn.querySelector(".btn-text");

            if (copyIcon) copyIcon.classList.add("hidden");
            if (checkIcon) checkIcon.classList.remove("hidden");
            if (btnText) btnText.textContent = "Kopyalandı!";

            setTimeout(() => {
              btn.classList.remove("text-emerald-400");
              if (copyIcon) copyIcon.classList.remove("hidden");
              if (checkIcon) checkIcon.classList.add("hidden");
              if (btnText) btnText.textContent = "Kopyala";
            }, 2000);
          } catch (err) {
            console.error("Kopyalama hatası:", err);
          }
        });

        // 🌟 Çift Tıklama İle Tüm Kodu Seçme Etkinliği
        const selectAllCode = (e: MouseEvent) => {
          // Kopyala butonuna basıldıysa işlem yapma
          if ((e.target as HTMLElement).closest(".code-block-copy-btn")) {
            return;
          }

          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            range.selectNodeContents(codeEl);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        };

        container.addEventListener("dblclick", selectAllCode);

        header.appendChild(langSpan);
        header.appendChild(btn);

        // Pre stilini Tailwind ile ez (.prose sınıfının varsayılan boşluklarını silmek için)
        pre.className = (pre.className || "") + " !m-0 !pt-3 !pb-4 !px-4 !bg-transparent !border-none !rounded-none !rounded-b-xl overflow-x-auto block !select-text !cursor-text";
        
        // Eğer code bloğu içerisinde inline block varsa blok elemana dönüştür
        if (codeEl.className) {
          codeEl.className = codeEl.className + " !block !select-text !cursor-text";
        } else {
          codeEl.className = "!block !select-text !cursor-text";
        }

        if (pre.parentNode) {
          pre.parentNode.insertBefore(container, pre);
          container.appendChild(header);
          container.appendChild(pre);
        }
      });
    };

    formatCodeBlocks();
    const timer = setInterval(formatCodeBlocks, 500);
    return () => clearInterval(timer);
  }, []);

  return null;
}
