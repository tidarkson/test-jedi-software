const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'
let apiOrigin = ''

try {
  apiOrigin = new URL(apiBaseUrl).origin
} catch {
  apiOrigin = ''
}

const isDevelopment = process.env.NODE_ENV !== 'production'

const cspDirectives = [
  "default-src 'self'",
  `connect-src 'self' ${[apiOrigin, isDevelopment ? 'ws:' : '', isDevelopment ? 'wss:' : '']
    .filter(Boolean)
    .join(' ')}`,
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self'${isDevelopment ? " 'unsafe-eval' 'unsafe-inline'" : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
          { key: 'Content-Security-Policy', value: cspDirectives },
        ],
      },
    ]
  },
}

export default nextConfig
