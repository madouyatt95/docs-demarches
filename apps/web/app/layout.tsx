// ============================================
// DOCSBOX WEB - Root Layout
// ============================================

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'DocsBox - Vos documents en ordre',
    description: 'Centralisez vos documents, ne ratez plus une échéance, simplifiez vos démarches administratives.',
    keywords: ['documents', 'administratif', 'démarches', 'coffre-fort', 'rappels', 'France'],
    authors: [{ name: 'DocsBox' }],
    creator: 'DocsBox',
    publisher: 'DocsBox',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://docsbox.fr'),
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        url: 'https://docsbox.fr',
        siteName: 'DocsBox',
        title: 'DocsBox - Vos documents en ordre',
        description: 'Centralisez vos documents, ne ratez plus une échéance, simplifiez vos démarches administratives.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DocsBox - Vos documents en ordre',
        description: 'Centralisez vos documents, ne ratez plus une échéance.',
    },
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#3B82F6',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="DocsBox" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </head>
            <body className={inter.className}>
                <Providers>{children}</Providers>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(function(registration) {
                                            console.log('SW registered: ', registration);
                                        })
                                        .catch(function(error) {
                                            console.log('SW registration failed: ', error);
                                        });
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
