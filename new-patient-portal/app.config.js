module.exports = {
  name: 'new-patient-portal',
  slug: 'new-patient-portal',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anonymous.newpatientportal'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.anonymous.newpatientportal'
  },
  extra: {
    eas: {
      projectId: "f3555f5c-f992-4644-a33a-043e22b93e31"
    }
  },
  updates: {
    url: 'https://u.expo.dev/f3555f5c-f992-4644-a33a-043e22b93e31'
  }
};