import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmergencySOS from "@/components/EmergencySOS";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "जीवन - Blood Donation System",
  description: "India's most trusted blood donation network. Save lives, donate blood.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jeevan",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: "जीवन - Blood Donation System",
    description: "India's most trusted blood donation network. Save lives, donate blood.",
    type: "website",
    locale: "en_IN",
    siteName: "Jeevan",
  },
  twitter: {
    card: "summary_large_image",
    title: "जीवन - Blood Donation System",
    description: "India's most trusted blood donation network. Save lives, donate blood.",
  },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <EmergencySOS />
        </Providers>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
