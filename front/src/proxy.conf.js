const PROXY_CONFIG = [
  {
    context: ['/api', '/socket.io'],
    target: 'http://localhost:3000',
    secure: false,
    pathRewrite: {
      '^/api': '',
      '^/socket.io': '/socket.io',
    },
  },
];

module.exports = PROXY_CONFIG;
