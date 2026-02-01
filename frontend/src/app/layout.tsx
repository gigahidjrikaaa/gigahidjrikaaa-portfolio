import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import AppProviders from "./providers";
import { apiService } from "@/services/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const OG_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517694712202-14dd9538a97?w=1200&h=630&fit=crop";

async function getSeoSettings() {
  try {
    const seo = await apiService.getPublicSeoSettings();
    return seo;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();

  const fullName = "Giga Hidjrika Aura Adkhy";
  const jobTitle = "Full Stack and Blockchain Developer";

  const title = seo?.site_title || `${fullName} - Blockchain Dev & Software Engineer`;
  const description = seo?.site_description || `Hi, I'm ${fullName}, a ${jobTitle}. I build AI-powered products and full-stack solutions in Web3, React, Next.js, and Python.`;
  const keywords = seo?.keywords || "blockchain, web3, ai, python, react, next.js, full-stack, software engineer, giga hidjrika, aura adkhy";
  const ogImage = seo?.og_image_url || OG_FALLBACK_IMAGE;
  const canonical = seo?.canonical_url || siteUrl;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
  };
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
        "@type": "Person",
        "name": "Giga Hidjrika Aura Adkhy",
        "jobTitle": "Full Stack and Blockchain Developer",
        "url": siteUrl,
        "sameAs": [
          "https://github.com/gigahidjrikaaa",
          "https://linkedin.com/in/gigahidjrikaaa",
          "https://twitter.com/gigahidjrikaaa",
        ],
        "knowsAbout": ["Blockchain", "Web Development", "AI/ML", "Full-Stack Development"],
        "description": "Full Stack and Blockchain Developer specializing in AI-powered products and Web3 solutions with React, Next.js, Python, and Solidity.",
      },
      {
        "@type": "WebSite",
        "name": "Giga Hidjrika Aura Adkhy",
        "url": siteUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "name": "Giga Hidjrika Aura Adkhy",
        "url": siteUrl,
      },
    ],
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen scroll-smooth">
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
