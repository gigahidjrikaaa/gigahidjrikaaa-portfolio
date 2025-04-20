import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: 'Giga Hidjrika - Blockchain Dev & Software Engineer',
  description: 'Personal portfolio showcasing projects in AI, Blockchain, and Web Development.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Navbar />
        <main className="container mx-auto px-4 py-8">{/* Basic container */}
          {children}
        </main>
      <Footer />
    </html>
  );
}
