import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const signUpSchema = z
  .object({
    email: z.string().email('Email no válido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Za-z]/, 'Debe incluir letras')
      .regex(/[0-9]/, 'Debe incluir números'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Nombre requerido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email no válido'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Za-z]/, 'Debe incluir letras')
      .regex(/[0-9]/, 'Debe incluir números'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
