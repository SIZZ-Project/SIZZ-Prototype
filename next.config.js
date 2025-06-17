const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        // 캐시 설정 최적화
        config.cache = {
            type: 'filesystem',
            version: '1.0.0',
            buildDependencies: {
                config: [__filename]
            }
        };
        return config;
    },
};

module.exports = nextConfig; 