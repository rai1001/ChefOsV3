import { Metadata } from "next";
import { LoginForm } from "@/modules/auth/ui/login-form";

export const metadata: Metadata = {
  title: "Acceder | ChefOS"
};

const LoginPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.2),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(56,189,248,0.2),transparent_28%)]" />
      <div className="relative grid w-full max-w-6xl gap-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Operativo desde minuto 1
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
              ChefOS Dashboard
            </h1>
            <p className="text-base text-slate-200/80">
              Accede con tu usuario real de Supabase. La app usa RLS end-to-end para aislar cada organizacion y funciona igual en local o staging.
            </p>
            <div className="grid gap-3 text-sm text-slate-200/80 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Seguridad</p>
                <p className="mt-1 font-semibold text-white">RLS + roles por organizacion</p>
                <p className="mt-1 text-xs text-slate-400">Sin service role en cliente.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Minuto 1</p>
                <p className="mt-1 font-semibold text-white">Seed con org y admin</p>
                <p className="mt-1 text-xs text-slate-400">Credenciales de prueba incluidas.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300/80">
            <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
              <p className="font-semibold text-white">Admin demo</p>
              <p>admin@example.com</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
              <p className="font-semibold text-white">Password</p>
              <p>changeme123</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-emerald-500/10 to-cyan-500/20 blur-3xl" />
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-lg">
            <LoginForm />
            <p className="mt-4 text-xs text-slate-400">
              Usa las credenciales seed o las de tu entorno de staging. Si no tienes usuario, ejecuta <code>pnpm seed:admin</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
