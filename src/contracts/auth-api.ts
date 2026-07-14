import { ThemeId } from '@/game/themeSchema'
import { z } from 'zod'

export const EmailInput = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(320)

export const PasswordInput = z
  .string()
  .min(1, 'Password is required')
  .max(256, 'Password is too long')

export const UsernameInput = z
  .string()
  .trim()
  .min(1, 'Username is required')
  .max(64, 'Username is too long')

export const CredentialsInput = z.object({
  email: EmailInput,
  password: PasswordInput,
})
export type CredentialsInput = z.infer<typeof CredentialsInput>

export const RegisterRequest = z
  .object({
    email: EmailInput,
    password: PasswordInput,
    confirmPassword: PasswordInput,
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Accept the terms to continue' }),
    }),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }
  })
export type RegisterRequest = z.infer<typeof RegisterRequest>

export const RegisterResponse = z.object({ email: z.string().email() })
export type RegisterResponse = z.infer<typeof RegisterResponse>

export const UpdateUsernameRequest = z.object({
  type: z.literal('username'),
  username: UsernameInput,
})
export type UpdateUsernameRequest = z.infer<typeof UpdateUsernameRequest>

export const UpdatePasswordRequest = z
  .object({
    type: z.literal('password'),
    password: PasswordInput,
    confirmPassword: PasswordInput,
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }
  })
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequest>

export const UpdateThemeRequest = z.object({
  type: z.literal('theme'),
  themeId: ThemeId,
})
export type UpdateThemeRequest = z.infer<typeof UpdateThemeRequest>

export const UpdateMeRequest = z.union([
  UpdateUsernameRequest,
  UpdatePasswordRequest,
  UpdateThemeRequest,
])
export type UpdateMeRequest = z.infer<typeof UpdateMeRequest>

export const MeDto = z.object({
  id: z.string(),
  displayName: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  emailVerified: z.string().datetime().nullable(),
  image: z.string().nullable(),
  isAdmin: z.boolean(),
  themeId: ThemeId,
  hasPassword: z.boolean(),
  providers: z.array(z.string()),
})
export type MeDto = z.infer<typeof MeDto>

export const MeResponse = MeDto.nullable()
export type MeResponse = z.infer<typeof MeResponse>

export const ImpersonateRequest = z.object({ userId: z.string().min(1) })
export type ImpersonateRequest = z.infer<typeof ImpersonateRequest>

export const ImpersonateGrant = z.object({
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
})
export type ImpersonateGrant = z.infer<typeof ImpersonateGrant>
