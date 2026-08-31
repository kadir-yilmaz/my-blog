"use server";

// ==========================================
// 🎓 Contact Server Action (Nodemailer SMTP + Auto-Responder)
// ==========================================

import nodemailer from "nodemailer";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/contact";

export async function sendContactEmailAction(input: ContactFormInput) {
  // 1. Zod Doğrulaması
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Lütfen tüm alanları geçerli şekilde doldurunuz.",
    };
  }

  const { name, email, subject, message } = parsed.data;

  // 2. SMTP Ayarları
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || "kadiryilmaz19821@gmail.com";

  if (!user || !pass) {
    console.error("SMTP_USER veya SMTP_PASS ortam değişkenleri tanımlı değil.");
    return {
      success: false,
      error: "E-posta gönderim servisi yapılandırılmamış. Lütfen sistem yöneticisiyle iletişime geçiniz.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const nowFormatted = new Date().toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      dateStyle: "long",
      timeStyle: "short",
    });

    const sanitizedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 1. Size (Blog Sahibine) Gelen Bildirim E-postası
    const sendAdminMail = transporter.sendMail({
      from: `"my-blog-contact (${name})" <${user}>`,
      replyTo: `"${name}" <${email}>`,
      to: receiver,
      subject: `my-blog-contact (sender: ${email}) — ${subject}`,
      text: `${message}\n\n----------------------------------------\nGönderen Bilgileri:\nAd Soyad: ${name}\nE-posta: ${email}\nKonu: ${subject}\nTarih: ${nowFormatted}\n----------------------------------------`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">📬 Yeni Blog Mesajı</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Konu: <strong>${subject}</strong></p>
          </div>

          <div style="font-size: 15px; line-height: 1.7; color: #1e293b; padding: 10px 0; white-space: pre-wrap;">${sanitizedMessage}</div>

          <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Gönderen Bilgileri</p>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 90px;"><strong>Ad Soyad:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>E-posta:</strong></td>
                <td style="padding: 4px 0;"><a href="mailto:${email}" style="color: #ef4444; text-decoration: none; font-weight: 600;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Tarih:</strong></td>
                <td style="padding: 4px 0; color: #64748b; font-size: 13px;">${nowFormatted}</td>
              </tr>
            </table>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
            💡 <em>Bu e-postaya doğrudan <strong>"Yanıtla" (Reply)</strong> diyerek <strong>${email}</strong> adresine cevap verebilirsiniz.</em>
          </div>
        </div>
      `,
    });

    // 2. Ziyaretçiye Giden Otomatik Bilgilendirme / Teyit E-postası (Auto-Responder)
    const sendVisitorConfirmationMail = transporter.sendMail({
      from: `"Kadir Yılmaz" <${user}>`,
      replyTo: receiver,
      to: email,
      subject: `Mesajınız Alındı: ${subject} — Kadir Yılmaz`,
      text: `Merhaba ${name},\n\nBlogum üzerinden gönderdiğiniz mesaj tarafıma başarıyla ulaştı. En kısa sürede inceleyip sizinle iletişime geçeceğim.\n\nGönderdiğiniz Mesaj:\n${message}\n\nSaygılarımla,\nKadir Yılmaz\n.NET Backend & DevOps Developer`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">✅ Mesajınız Başarıyla İletildi</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Kadir Yılmaz — Kişisel Blog & Portfolyo</p>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Merhaba <strong>${name}</strong>,<br/><br/>
            Blogum üzerinden gönderdiğiniz mesaj tarafıma başarıyla ulaştı. En kısa sürede inceleyip bu e-posta adresiniz üzerinden geri dönüş sağlayacağım.
          </p>

          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Gönderdiğiniz Mesajın Bir Kopyası</p>
            <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Konu:</strong> ${subject}</p>
            <div style="margin-top: 10px; padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${sanitizedMessage}</div>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; font-size: 13px; color: #64748b;">
            <p style="margin: 0 0 4px 0;">Saygılarımla,</p>
            <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 15px;">Kadir Yılmaz</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">.NET Backend & DevOps Developer</p>
          </div>
        </div>
      `,
    });

    // İki e-postayı eşzamanlı olarak gönder
    await Promise.all([sendAdminMail, sendVisitorConfirmationMail]);

    return {
      success: true,
      message: "Mesajınız başarıyla iletildi! E-posta adresinize bir onay kopyası gönderildi.",
    };
  } catch (error: any) {
    console.error("Nodemailer e-posta gönderim hatası:", error);
    return {
      success: false,
      error: "E-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz veya doğrudan mail atınız.",
    };
  }
}
