import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı")
    .max(100, "İsim en fazla 100 karakter olabilir"),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz"),
  subject: z
    .string()
    .min(3, "Konu en az 3 karakter olmalı")
    .max(200, "Konu en fazla 200 karakter olabilir"),
  message: z
    .string()
    .min(10, "Mesaj en az 10 karakter olmalı")
    .max(5000, "Mesaj en fazla 5000 karakter olabilir"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
