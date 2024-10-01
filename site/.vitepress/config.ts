import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
    lastUpdated: true,
    sitemap: {
        hostname: 'https://verify.scim.dev'
    },
    title: 'SCIM Verify',
    titleTemplate: 'verify.scim.dev',
    description: "SCIM Verify is a conformance testing tool to verify your SCIM 2.0 implementation complies with the specifications.",
    head: [
        [
            'meta',
            { property: 'og:image', content: '/scimverify-ogimage.png' }

        ],
        [
            'link',
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' }
        ],
        [
            'script',
            { defer: 'true', src: 'https://cloud.umami.is/script.js', 'data-website-id': '861bf081-5d80-4641-a7da-c688f9d50d7f' }
        ]
    ],
    vite: {
        server: {
            allowedHosts: [
                'verify.scim.local',
                'localhost'
            ]
        }
    },
    themeConfig: {
        footer: {
            copyright: 'Copyright © 2025-present <a href="https://www.a11n.nl/">a11n</a>'
        },
        nav: [
            { text: 'About', link: '/about/' },
            {
                text: 'Documentation',
                link: '/docs/'

            },
            { text: 'Docker', link: '/docker/' },
            { text: 'SCIM Playground', link: 'https://scim.dev', target: '_blank', rel: 'noopener' }
        ],
        sidebar:
        {
            '/docs/': {
                text: 'Documentation',
                items: [
                    { text: 'Limitations of SCIM', link: '/docs/limitations' },
                ]
            }

        }
    },
    markdown: {

    }
})
