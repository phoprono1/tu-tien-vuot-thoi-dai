import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tu Tiên Vượt Thời Đại - MMO Cultivation Game",
  description:
    "Nhập vai tu tiên, khám phá thế giới tu luyện bí ẩn. Chọn con đường tu luyện của bạn và trở thành bậc thầy tu tiên.",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#9333ea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tu Tiên Game",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Tu Tiên Game" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>

        {/* PWA Install Prompt Helper - No Service Worker Needed */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // PWA install prompt (works without service worker)
              let deferredPrompt;
              
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('PWA install prompt available');
                deferredPrompt = e;
                // You can show custom install button here
              });

              window.addEventListener('appinstalled', () => {
                console.log('PWA installed successfully!');
                deferredPrompt = null;
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
