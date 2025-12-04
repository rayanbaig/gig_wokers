import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "GigGuard - AI-Powered Algorithmic Auditor",
    description: "Detect shadow bans, wage theft, and unfair penalties on gig platforms instantly.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              // Suppress hydration warnings from browser extensions
              const originalError = console.error;
              console.error = (...args) => {
                if (typeof args[0] === 'string' && 
                    (args[0].includes('Hydration') || 
                     args[0].includes('hydration') ||
                     args[0].includes('did not match') ||
                     args[0].includes('darkreader'))) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
                    }}
                />
            </head>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
