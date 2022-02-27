module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/o/:organizationName',
        destination: '/o/:organizationName/flags',
        permanent: false,
      },
    ]
  },
}
