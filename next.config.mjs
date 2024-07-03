/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000', 'urban-space-zebra-wrvqwv6gpp5w29v6j-3000.app.github.dev'],
        },
    },
};

export default nextConfig;
