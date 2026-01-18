import { Metadata } from "next";
import { LoginForm } from "@/modules/auth/ui/login-form";

export const metadata: Metadata = {
  title: "Acceder | ChefOS"
};

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid gap-10 rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-slate-100 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100">
            Operativo desde minuto 1
          </span>
          <h1 className="text-3xl font-semibold text-slate-900">
            ChefOS Dashboard
          </h1>
          <p className="text-base text-slate-600">
            Inicia sesión con tu usuario de Supabase para entrar al panel
            multi-tenant. Todas las operaciones están protegidas por RLS y
            listas para usarse en entornos locales y staging.
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Login real contra Supabase Auth</li>
            <li>• Datos aislados por organización</li>
            <li>• Dashboard vacío pero funcional</li>
          </ul>
        </div>
        <div>
          <LoginForm />
          <p className="mt-3 text-xs text-slate-500">
            Usa las credenciales sembradas vía <code>pnpm seed:admin</code> o
            las de tu proyecto staging.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
