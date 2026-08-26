// ==========================================
// 🎓 Contact Form Component (Client Component)
// ==========================================
// Sunucu taraflı SMTP (Nodemailer) üzerinden doğrudan e-posta gönderir.

"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, User, Mail, MessageSquare, Tag, Loader2 } from "lucide-react";
import { sendContactEmailAction } from "@/actions/contact.actions";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await sendContactEmailAction({
        name,
        email,
        subject,
        message,
      });

      if (result.success) {
        setSuccessMessage(result.message || "Mesajınız başarıyla iletildi!");
        // Form alanlarını sıfırla
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setErrorMessage(result.error || "E-posta gönderilirken bir hata oluştu.");
      }
    } catch (err: any) {
      setErrorMessage("Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Başarı Bildirimi */}
      {successMessage && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-700 dark:text-green-300 space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span>Mesajınız Başarıyla İletildi!</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {successMessage}
          </p>
        </div>
      )}

      {/* Hata Bildirimi */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-300 space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Gönderim Başarısız</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {errorMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Ad Soyad */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Adınız Soyadınız</span>
            </label>
            <input
              id="name"
              type="text"
              required
              disabled={isSubmitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all disabled:opacity-50"
              placeholder="Adınızı giriniz"
            />
          </div>

          {/* E-posta */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span>E-posta Adresiniz</span>
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all disabled:opacity-50"
              placeholder="eposta@ornek.com"
            />
          </div>
        </div>

        {/* Konu */}
        <div className="space-y-1.5">
          <label htmlFor="subject" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Konu</span>
          </label>
          <input
            id="subject"
            type="text"
            required
            disabled={isSubmitting}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all disabled:opacity-50"
            placeholder="Proje Teklifi / Danışmanlık / Soru"
          />
        </div>

        {/* Mesaj */}
        <div className="space-y-1.5">
          <label htmlFor="message" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Mesajınız</span>
          </label>
          <textarea
            id="message"
            rows={5}
            required
            disabled={isSubmitting}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all resize-none disabled:opacity-50"
            placeholder="Mesajınızı buraya detaylıca yazabilirsiniz..."
          />
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gönderiliyor...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>E-posta Gönder</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
