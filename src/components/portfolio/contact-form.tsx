// ==========================================
// 🎓 Contact Form Component (Client Component)
// ==========================================
// Form doldurulduğunda doğrudan kadiryilmaz19821@gmail.com adresine mail yönlendirmesi yapar.

"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, User, MessageSquare, Tag } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const targetEmail = "kadiryilmaz19821@gmail.com";

  const getMailtoUrl = () => {
    const emailSubject = `[Blog İletişim] ${subject || "Yeni Mesaj"}`;
    const emailBody = `Gönderen: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`;
    return `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Doğrudan kullanıcının e-posta uygulamasını aç
    window.location.href = getMailtoUrl();
  };

  return (
    <div className="space-y-6">
      {submitted && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-700 dark:text-green-300 space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>E-posta Uygulamanız Başlatıldı!</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mesajınız hazırlandı ve e-posta istemcinize aktarıldı. Uygulamanız otomatik açılmadıysa aşağıdaki butona tıklayabilirsiniz:
          </p>
          <div className="pt-2">
            <a
              href={getMailtoUrl()}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-green-700 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-posta Uygulamasını Aç ({targetEmail})</span>
            </a>
          </div>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all"
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
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all"
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all resize-none"
            placeholder="Mesajınızı buraya detaylıca yazabilirsiniz..."
          />
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>E-posta Olarak Gönder ({targetEmail})</span>
        </button>
      </form>
    </div>
  );
}
