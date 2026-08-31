"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { registerTempImage, clearAllTempImages, processAndUploadEditorBlocks } from "@/lib/temp-image-store";
import "./editorjs-editor.css";

export interface EditorJsSaveResult {
  content: string;
  coverImage: string | null;
}

export interface EditorJsRef {
  save: () => Promise<EditorJsSaveResult>;
}

interface EditorJsEditorProps {
  initialContent?: string;
  onChange?: (jsonString: string) => void;
}

// Convert legacy/various formats into Editor.js OutputData
function parseInitialData(content?: string) {
  if (!content || !content.trim()) {
    return { blocks: [] };
  }

  try {
    const parsed = JSON.parse(content);
    // Standard Editor.js OutputData
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
      return parsed;
    }
    // Legacy BlockNote blocks array format
    if (Array.isArray(parsed)) {
      const blocks = parsed.map((item: any, index: number) => {
        const type = item.type === "heading" ? "header" : item.type === "codeBlock" ? "code" : "paragraph";
        let text = "";
        if (Array.isArray(item.content)) {
          text = item.content.map((c: any) => c.text || "").join("");
        }
        return {
          id: item.id || `block-${index}`,
          type,
          data: type === "header" 
            ? { text, level: item.props?.level || 2 } 
            : type === "code" 
            ? { code: text } 
            : { text },
        };
      });
      return { blocks };
    }
  } catch {
    // If raw markdown or text
    return {
      blocks: [
        {
          type: "paragraph",
          data: { text: content },
        },
      ],
    };
  }

  return { blocks: [] };
}

const EditorJsEditor = forwardRef<EditorJsRef, EditorJsEditorProps>(function EditorJsEditor(
  { initialContent, onChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      async save(): Promise<EditorJsSaveResult> {
        if (editorInstanceRef.current && typeof editorInstanceRef.current.save === "function") {
          try {
            const rawData = await editorInstanceRef.current.save();
            
            // 🎓 Akıllı Yükleme: Kaydetme anında geçici `blob:` ve `data:` resimlerini kalıcı olarak yükle
            const processed = await processAndUploadEditorBlocks(rawData.blocks || []);
            
            const finalData = {
              ...rawData,
              blocks: processed.blocks,
            };

            return {
              content: JSON.stringify(finalData),
              coverImage: processed.coverImage,
            };
          } catch (err) {
            console.error("Editor.js save imperative error:", err);
            throw err;
          }
        }
        return {
          content: initialContent || "",
          coverImage: null,
        };
      },
    }),
    [initialContent]
  );

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    let editorInstance: any = null;

    async function initEditor() {
      // Dynamic imports for Editor.js and plugins (SSR compatibility)
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Code = (await import("@editorjs/code")).default;
      const InlineCode = (await import("@editorjs/inline-code")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const Delimiter = (await import("@editorjs/delimiter")).default;
      const Table = (await import("@editorjs/table")).default;
      const Checklist = (await import("@editorjs/checklist")).default;
      const Marker = (await import("@editorjs/marker")).default;

      if (!containerRef.current) return;

      const initialData = parseInitialData(initialContent);

      editorInstance = new EditorJS({
        holder: containerRef.current,
        data: initialData,
        placeholder: "İçeriğinizi yazmaya başlayın...",
        inlineToolbar: true,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              placeholder: "Başlık yazın...",
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          code: {
            class: Code,
            config: {
              placeholder: "Kod buraya...",
            },
          },
          inlineCode: {
            class: InlineCode,
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                /**
                 * 🎓 Akıllı Önizleme (Instant Preview)
                 * Dosya seçildiğinde sunucuya gitmeden anında blob URL üretir.
                 * Mikro-gecikme (60ms) ile @editorjs/image kütüphanesinin iç FileReader'ı ile senkronize olur,
                 * spinner takılması veya görselin gizlenmesi kesin olarak engellenir.
                 */
                async uploadByFile(file: File) {
                  try {
                    const blobUrl = registerTempImage(file);
                    await new Promise((resolve) => setTimeout(resolve, 60));
                    return {
                      success: 1,
                      file: {
                        url: blobUrl,
                      },
                    };
                  } catch (err: any) {
                    console.error("Preview creation error:", err);
                    throw new Error("Önizleme oluşturulamadı.");
                  }
                },
                /**
                 * Uzak URL veya pano kopyalamasında anında önizleme
                 */
                async uploadByUrl(url: string) {
                  return {
                    success: 1,
                    file: {
                      url,
                    },
                  };
                },
              },
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: "Alıntı metni...",
              captionPlaceholder: "Alıntı sahibi...",
            },
          },
          delimiter: Delimiter,
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          marker: Marker,
        },
        async onChange(api) {
          try {
            const savedData = await api.saver.save();
            if (onChange) {
              onChange(JSON.stringify(savedData));
            }
          } catch (err) {
            console.error("Editor.js onChange error:", err);
          }
        },
      });

      await editorInstance.isReady;
      editorInstanceRef.current = editorInstance;
      isInitializedRef.current = true;
    }

    initEditor();

    return () => {
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === "function") {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
        isInitializedRef.current = false;
      }
      // Sayfadan çıkıldığında geçici blob URL'lerini temizle
      clearAllTempImages();
    };
  }, []);

  // 🎓 EditorJS Kod Blokları (.ce-code__textarea) Etkinlik Dinleyicisi
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCodeEvents = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains("ce-code__textarea")) {
        const textarea = target as HTMLTextAreaElement;

        // Yükseklik Otomatik Ayarla (Auto-resize)
        if (e.type === "input" || e.type === "focus") {
          textarea.style.height = "auto";
          textarea.style.height = Math.max(100, textarea.scrollHeight) + "px";
        }

        if (e.type === "keydown") {
          const ke = e as KeyboardEvent;

          // TAB Tuşu ile Girinti (Indentation) Ekleme
          if (ke.key === "Tab") {
            ke.preventDefault();
            ke.stopPropagation();

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            // 2 boşluk ekle
            textarea.value = value.substring(0, start) + "  " + value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 2;

            // Editor.js state'inin güncellenmesi için input event fırlat
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
          }

          // Ctrl+A / Cmd+A
          if ((ke.ctrlKey || ke.metaKey) && ke.key.toLowerCase() === "a") {
            ke.stopPropagation();
            textarea.select();
          }
        }

        if (e.type === "dblclick") {
          textarea.select();
        }
      }
    };

    container.addEventListener("keydown", handleCodeEvents, true);
    container.addEventListener("dblclick", handleCodeEvents, true);
    container.addEventListener("input", handleCodeEvents, true);
    container.addEventListener("focus", handleCodeEvents, true);

    return () => {
      container.removeEventListener("keydown", handleCodeEvents, true);
      container.removeEventListener("dblclick", handleCodeEvents, true);
      container.removeEventListener("input", handleCodeEvents, true);
      container.removeEventListener("focus", handleCodeEvents, true);
    };
  }, []);

  return (
    <div className="editorjs-wrapper">
      <div ref={containerRef} id="editorjs" />
    </div>
  );
});

export default EditorJsEditor;
