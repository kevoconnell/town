/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@my-town/shared'],
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
