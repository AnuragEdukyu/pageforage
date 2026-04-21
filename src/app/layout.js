import "./globals.css";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "PageForge | Transform Content into Stunning Pages",
  description: "The ultimate tool for writers to turn manuscripts into beautiful web pages instantly.",
};

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${outfit.className} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-full flex flex-col`}
      >
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-950" />
        <main className="flex-1 flex flex-col">{children}</main>
        <ToastContainer position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
