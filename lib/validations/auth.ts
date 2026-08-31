import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı")
    .max(50, "İsim en fazla 50 karakter olabilir"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalı")
    .max(100, "Şifre en fazla 100 karakter olabilir"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
