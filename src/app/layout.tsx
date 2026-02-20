
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as it's standard
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Backoffice Ambiente SMT",
  description: "Panel de gestión de residuos y programas",
  icons: {
    icon: '/logo-ambiente.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className={cn(inter.className, "h-full")}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

