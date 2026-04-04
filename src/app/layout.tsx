import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoursUE Admin",
  description: "Admin dashboard for CoursUE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

