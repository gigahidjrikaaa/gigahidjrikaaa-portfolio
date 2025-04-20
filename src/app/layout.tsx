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
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">{/* Basic container & grow */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
