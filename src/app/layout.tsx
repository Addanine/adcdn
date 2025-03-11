import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { initializeApp } from "~/lib/init";

// Initialize application on startup
initializeApp().catch(error => {
  console.error("Failed to initialize application:", error);
});

export const metadata: Metadata = {
  title: "ADCDN - Content Delivery Network",
  description: "A simple and secure platform for content delivery and file sharing",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
