/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // PWA support (optional avec next-pwa)
    // Uncomment when adding next-pwa:
    // pwa: {
    //   dest: 'public',
    //   register: true,
    //   skipWaiting: true,
    // },

    // Headers de sécurité
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(self), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    // Transpile le package core
    transpilePackages: ['@docsbox/core'],
};

module.exports = nextConfig;
