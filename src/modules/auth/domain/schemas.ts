import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Introduce un correo válido")
    .max(255, "Correo demasiado largo"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(200, "Contraseña demasiado larga")
});

export type LoginInput = z.infer<typeof loginSchema>;
