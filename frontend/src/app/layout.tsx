import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext"; // Import the provider

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
        <AuthProvider> {/* Wrap components with the provider */}
          <Navbar />
          <main className="flex-grow" id="main-content">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}