import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import { SchoolDataProvider } from "@/components/context/SchoolDataContext";
// const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
// const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { AppDataProvider } from "./providers/AppDataProvider";
import { SessionProvider } from "next-auth/react";

// app/layout.jsx

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  // Standard system fonts that look similar to Inter
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Arial",
  ],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  // Standard monospaced fallbacks
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
  ],
});

export const metadata = {
  title: "SmartSchool – School Management System",
  description:
    "Manage students, fees, attendance, exams and reports with SmartSchool.",
  keywords: [
    "school management system",
    "student management",
    "fee management",
    "attendance system",
  ],
  openGraph: {
    title: "SmartSchool",
    description:
      "All-in-one school management platform for modern institutions.",
    url: "https://smartschool.app",
    siteName: "SmartSchool",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartSchool Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSchool",
    description: "Modern school management system",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script> */}
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <SchoolDataProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <ServiceWorkerRegister />
              {children}
              <Toaster />
            </ThemeProvider>
          </SchoolDataProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}