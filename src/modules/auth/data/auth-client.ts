import { toAuthError, toUnknownError } from "@/modules/shared/domain/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LoginInput } from "../domain/schemas";

export const signInWithEmail = async (input: LoginInput) => {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid")) {
      throw toAuthError("Credenciales incorrectas");
    }
    throw toUnknownError("Error al iniciar sesión", { code: error.code });
  }
};

export const signOut = async () => {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw toUnknownError("No se pudo cerrar sesión", { code: error.code });
  }
};
