import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import InstallAppBanner from "@/components/InstallAppBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crocsdkr - Le confort original à Dakar",
  description: "Boutique officielle de Crocs à Dakar. Découvrez notre collection de chaussures confortables et stylées. Livraison rapide dans toute la ville.",
  keywords: "Crocs, Dakar, chaussures, confort, boutique, Sénégal",
  manifest: "/manifest.json",
  icons: { apple: "/logo-noir.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Crocsdkr",
  },
  openGraph: {
    title: "Crocsdkr - Le confort original à Dakar",
    description: "Boutique officielle de Crocs à Dakar",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <InstallAppBanner />
        </CartProvider>
      </body>
    </html>
  );
}
