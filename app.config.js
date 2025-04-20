module.exports = {
  expo: {
    name: 'KAZI',
    slug: 'kazi',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kazi.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'This app needs access to location when open to show your current location on the map.',
        NSLocationAlwaysUsageDescription: 'This app needs access to location when in the background to show your current location on the map.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs access to location when open and in the background to show your current location on the map.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.kazi.app',
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
      ],
    },
    web: {
      favicon: './assets/images/icon.png'
    },
    plugins: [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location to show your current location on the map.",
          "locationAlwaysPermission": "Allow $(PRODUCT_NAME) to use your location in the background to show your current location on the map.",
          "locationWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location when open to show your current location on the map.",
        },
      ],
    ],
  },
}; 