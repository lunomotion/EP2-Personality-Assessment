import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Praxia Insights",
  description: "Discover your entrepreneurial personality type and potential business opportunities with the EP2 Assessment.",
  metadataBase: new URL("https://www.praxiainsights.com"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    siteName: "Praxia Insights",
    title: "Praxia Insights",
    url: "https://www.praxiainsights.com",
    type: "website",
  },
  twitter: {
    title: "Praxia Insights",
    card: "summary",
  },
  alternates: {
    canonical: "https://www.praxiainsights.com",
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "http://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "Praxia Insights",
      "url": "https://www.praxiainsights.com",
      "description": "Discover your entrepreneurial personality type and potential business opportunities with the EP2 Assessment."
    },
    {
      "@type": "Organization",
      "legalName": "Praxia Insights",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "United States"
      },
      "email": "cole.annie.m@gmail.com"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
