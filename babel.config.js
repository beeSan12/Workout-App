// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo', // Expo preset includes metro-react-native preset
      '@babel/preset-typescript',
      ['@babel/preset-react', {runtime: 'automatic'}], // Automatic JSX runtime
    ],
    plugins: [
      '@babel/plugin-transform-runtime', // Transforms async/await and other modern features
      '@babel/plugin-syntax-dynamic-import', // For dynamic imports
    ],
  }
}
