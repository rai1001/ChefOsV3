"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/modules/shared/ui/error-message";
import { signInWithEmail } from "../data/auth-client";
import { LoginInput, loginSchema } from "../domain/schemas";

export const LoginForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<unknown>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (values: LoginInput) => {
    setError(null);
    startTransition(async () => {
      try {
        await signInWithEmail(values);
        router.replace("/dashboard");
      } catch (err) {
        setError(err);
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100"
    >
      <div>
        <label className="text-sm font-medium text-slate-800" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="mt-1 text-xs text-red-600">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div>
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="mt-1 text-xs text-red-600">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      <ErrorMessage error={error} />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Accediendo..." : "Entrar"}
      </button>
    </form>
  );
};
