import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Introduce un correo valido")
    .max(255, "Correo demasiado largo"),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(200, "Contrasena demasiado larga")
});

export type LoginInput = z.infer<typeof loginSchema>;
