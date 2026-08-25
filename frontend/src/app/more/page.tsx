// src/app/more/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Awards from "@/components/Awards";
import Certificates from "@/components/Certificates";
import Clients from "@/components/Clients";
import PressMentions from "@/components/PressMentions";
import GitHubIntegration from "@/components/GitHubIntegration";
import Stories from "@/components/Stories";
import VisitorMap from "@/components/VisitorMap";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Know more — Giga Hidjrika",
  description:
    "Awards, certifications, clients, press features, GitHub activity, behind-the-scenes stories, and where visitors come from — the fuller picture behind the homepage.",
  alternates: {
    canonical: `${siteUrl}/more`,
  },
  openGraph: {
    title: "Know more — Giga Hidjrika",
    description:
      "Awards, certifications, clients, press features, GitHub activity, and behind-the-scenes stories.",
    url: `${siteUrl}/more`,
    type: "website",
  },
};

export default function MorePage() {
  return (
    <>
      <header className="bg-zinc-50 pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to portfolio
          </Link>
          <h1 className="mt-6 max-w-2xl text-4xl font-medium tracking-tight text-zinc-900 md:text-5xl">
            Know <span className="text-zinc-400">more.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
            The fuller picture behind the homepage: recognition, credentials,
            clients, press, open-source activity, and moments from along the way.
          </p>
        </div>
      </header>

      <Awards />

      <Certificates />

      <Clients />

      <PressMentions />

      <GitHubIntegration />

      <Stories />

      <VisitorMap />
    </>
  );
}
