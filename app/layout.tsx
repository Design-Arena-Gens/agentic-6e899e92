import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F.R.I.D.A.Y - AI Assistant",
  description: "Advanced AI Assistant with 300+ features powered by Ollama and Vosk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
