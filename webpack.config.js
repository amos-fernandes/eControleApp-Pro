const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add proxy for CORS in development
  if (config.devServer) {
    config.devServer.proxy = {
      '/api': {
        target: 'https://testeaplicativo.econtrole.com',
        changeOrigin: true,
        secure: true,
        pathRewrite: { '^/api': '' }, // Remove /api prefix when proxying
      },
      '/login': {
        target: 'https://testeaplicativo.econtrole.com',
        changeOrigin: true,
        secure: true,
      },
    };
  }

  return config;
};
