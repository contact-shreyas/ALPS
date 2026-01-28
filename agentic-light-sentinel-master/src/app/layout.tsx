import "../styles/globals.css";
import "../styles/map-cursor.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "INFINITY LOOP",
  description: "Advanced light pollution monitoring and alerting system powered by INFINITY LOOP."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black relative antialiased">
        <Providers>
          <Navbar />
          <main className="absolute inset-0 mt-16 px-6">{children}</main>
          <Footer />
          <Toaster />
          <SonnerToaster position="top-center" closeButton richColors />
        </Providers>
      </body>
    </html>
  );
}
