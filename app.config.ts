import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "oma-kulu",
  slug: "oma-kulu",
  version: "3.1.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "omakulu",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.omakulu.app",
    "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false
    }
  },
  android: {
    package: "com.omakulu.app",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        organization: "benjamin-kz",
        project: "oma-kulu",
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "15462d70-a977-4183-80b9-1ea7323ba9fc",
    },
  },
  updates: {
    url: "https://u.expo.dev/15462d70-a977-4183-80b9-1ea7323ba9fc",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
