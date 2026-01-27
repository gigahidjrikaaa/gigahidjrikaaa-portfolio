import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import AppProviders from "@/app/providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: 'Giga Hidjrika - Blockchain Dev & Software Engineer',
  description: 'Personal portfolio showcasing projects in AI, Blockchain, and Web Development.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Giga Hidjrika - Blockchain Dev & Software Engineer',
    description: 'Personal portfolio showcasing projects in AI, Blockchain, and Web Development.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giga Hidjrika - Blockchain Dev & Software Engineer',
    description: 'Personal portfolio showcasing projects in AI, Blockchain, and Web Development.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Giga Hidjrika",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "Giga Hidjrika",
        url: siteUrl,
      },
    ],
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProviders>
          <Navbar />
          <main className="flex-grow" id="main-content">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}