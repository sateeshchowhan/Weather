module.exports = function(api) {
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@': './src',
      },
    }],
  ],
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
