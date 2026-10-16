import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seka Homes | Short-term stays in Guzape, Abuja",
  description: "Explore Seka Homes in Guzape, Abuja and prepare a booking request. Ask about optional transport with a separate quote. All requests are subject to confirmation.",
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL), alternates: { canonical: "/" } } : {}),
  openGraph: { title: "Seka Homes · Guzape, Abuja", description: "Plan your stay and request dates with Seka Homes.", type: "website", locale: "en_NG" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
