import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import { SchoolDataProvider } from "@/components/context/SchoolDataContext";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { AppDataProvider } from "./providers/AppDataProvider";

export const metadata = {
  title: "EduManage Pro - School Management System",
  description:
    "A comprehensive school management system for managing students, teachers, attendance, exams, fees, and more.",
  keywords: [
    "school management",
    "education",
    "student management",
    "attendance",
    "exams",
  ],
  generator: "v0.app",
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
      <SchoolDataProvider>
        {/* <AppDataProvider> */}
        <body
          className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
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
          <Analytics />
        </body>
        {/* </AppDataProvider> */}
      </SchoolDataProvider>
    </html>
  );
}
