import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "ChefOS",
  description: "Operativo desde minuto 1: Supabase + Next.js multi-tenant"
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="es">
      <body className={`${sora.variable} bg-slate-50 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
