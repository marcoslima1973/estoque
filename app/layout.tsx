import type { Metadata } from "next";
import "./globals.css";
import "./inventory.css";

export const metadata: Metadata = {
  title: "Controle de Estoque",
  description: "Produtos, entradas, saídas e exportação de estoque.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
