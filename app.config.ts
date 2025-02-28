import {ExpoConfig, ConfigContext} from 'expo/config'

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'myNewWorkoutApp',
  slug: 'my-new-workout-app',
  scheme: 'mynewworkoutapp',
  version: '1.0.0',
  assetBundlePatterns: [
    '**/*',
    './node_modules/react-native-vector-icons/Fonts/*',
    'app/Pictures/*',
    './app/Resources/*',
    './app/assets/**/*',
  ],
  platforms: ['web'],
  web: {
    output: 'static',
    bundler: 'metro',
    publicPath: '/dist',
    fonts: {
      Ionicons: './node_modules/react-native-vector-icons/Fonts/Ionicons.ttf',
      MaterialCommunityIcons:
        './node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf',
    },
  },
  owner: 'bsandeveloper',
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  plugins: ['expo-font', 'expo-router', 'expo-asset'],
})
