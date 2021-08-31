module.exports = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src/']
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: process.env.DISCORD_AUTH_URL,
        permanent: false
      }
    ]
  },
  webpack(config) {
    console.log(config)
    config.module.rules.push({
      test: /\.svg$/,
      use: [ "@svgr/webpack" ]
    })

    return config
  }
}
