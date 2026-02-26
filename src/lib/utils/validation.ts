import { z } from "zod"

export const emailSchema = z.string().email("올바른 이메일 형식이 아닙니다.")
export const passwordSchema = z.string().min(8, "비밀번호는 8자 이상이어야 합니다.")
export const phoneSchema = z
  .string()
  .regex(/^010\d{8}$/, "올바른 휴대폰 번호 형식이 아닙니다. (010XXXXXXXX)")

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
    phone: phoneSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
