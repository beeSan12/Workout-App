import {getDefaultConfig} from '@expo/metro-config'
import path from 'path'

interface MetroConfig {
  resolver: {
    sourceExts: string[]
    resolverMainFields: string[]
    extraNodeModules: Record<string, string>
    assetExts: string[]
  }
  watchFolders: string[]
  output: {
    publicPath: string
  }
  server?: MetroServerConfig
  transformer?: MetroTransformerConfig
}

interface MetroTransformerConfig {
  babelTransformerPath: string
  enableBabelRCLookup?: boolean
  sourceMap?: boolean
}

interface MetroServerConfig {
  useFastRefresh?: boolean
  enableWebsockets?: boolean
  enhanceMiddleware?: (metroMiddleware: any, metroServer: any) => any
  forwardClientLogs?: boolean
  verifyConnections?: boolean
}

export default (async (): Promise<MetroConfig> => {
  const config = await getDefaultConfig(__dirname)

  if (!config || !config.resolver) {
    throw new Error('Failed to load metro config')
  }

  const serverConfig = (config.server as MetroServerConfig) || {}

  // Modify production-specific settings safely
  if (process.env.NODE_ENV === 'production') {
    serverConfig.useFastRefresh = false
    serverConfig.enableWebsockets = false
  }

  const transformerConfig = (config.transformer as MetroTransformerConfig) || {}

  if (process.env.NODE_ENV === 'production') {
    transformerConfig.enableBabelRCLookup = false
    transformerConfig.sourceMap = false
  }

  // Ensure babelTransformerPath is always assigned a valid string
  transformerConfig.babelTransformerPath =
    transformerConfig.babelTransformerPath ||
    require.resolve('metro-react-native-babel-transformer')

  const mutableAssetExts = [...(config.resolver.assetExts || [])] // Create a mutable copy
  config.resolver.assetExts = [
    ...new Set([
      ...mutableAssetExts.filter(ext => ext !== 'png' && ext !== 'ttf'), // Filter out duplicates
      'ttf',
      'png',
    ]),
  ]

  return {
    ...config,
    server: serverConfig,
    transformer: {
      ...transformerConfig,
      babelTransformerPath:
        transformerConfig.babelTransformerPath ||
        require.resolve('metro-react-native-babel-transformer'),
    },
    resolver: {
      ...config.resolver,
      assetExts: [...config.resolver.assetExts],
      sourceExts: [
        ...(config.resolver.sourceExts || []),
        'jsx',
        'js',
        'ts',
        'tsx',
      ],
      resolverMainFields: ['browser', 'main'],
      extraNodeModules: {
        events: require.resolve('events'),
        eventemitter3: path.resolve(__dirname, 'node_modules/eventemitter3'),
        'react-native': path.resolve(
          __dirname,
          'node_modules/react-native-web',
        ),
        'react-native-web': path.resolve(
          __dirname,
          'node_modules/react-native-web',
        ),
        'react-native-vector-icons': path.resolve(
          __dirname,
          'node_modules/react-native-vector-icons',
        ),
      },
    },
    watchFolders: [
      ...(config.watchFolders || []),
      path.resolve(__dirname, 'app'),
    ],
    output: {
      publicPath: '/assets',
    },
  }
})()
