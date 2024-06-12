/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        loader: "imgix",
        path: "",
    },
    images: { unoptimized: true } ,
    distDir: 'build',
  };

module.exports = nextConfig
