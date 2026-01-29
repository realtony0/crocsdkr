import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crocsdkr - Le confort original à Dakar",
  description: "Boutique officielle de Crocs à Dakar. Découvrez notre collection de chaussures confortables et stylées. Livraison rapide dans toute la ville.",
  keywords: "Crocs, Dakar, chaussures, confort, boutique, Sénégal",
  openGraph: {
    title: "Crocsdkr - Le confort original à Dakar",
    description: "Boutique officielle de Crocs à Dakar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
