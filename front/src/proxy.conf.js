const PROXY_CONFIG = [
  {
    context: ['/api', '/socket.io'],
    target: 'http://localhost:3002',
    secure: false,
    pathRewrite: {
      '^/api': '',
      '^/socket.io': '',
    },
  },
];

module.exports = PROXY_CONFIG;
