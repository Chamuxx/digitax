import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "DigiTax — Property Tax Assessment Portal",
    template: "%s | DigiTax",
  },
  description:
    "A digital property tax assessment platform for local authorities. Assess house properties, calculate tax dynamically, and allow property owners to view their tax details.",
  keywords: ["property tax", "assessment", "municipal", "Sri Lanka", "DigiTax"],
  authors: [{ name: "DigiTax" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} h-full`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              richColors
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily: "var(--font-sans)",
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
