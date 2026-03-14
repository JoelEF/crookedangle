import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Trading Tracker",
  slug: "trading-tracker",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0a0e1a",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jouwbedrijf.tradingtracker", // ← aanpassen
    buildNumber: "1",
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0a0e1a",
    },
    package: "com.jouwbedrijf.tradingtracker", // ← aanpassen
  },
  web: {
    bundler: "metro",
  },
  plugins: ["expo-router", "expo-font"],
  scheme: "tradingtracker",
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
    eas: {
      projectId: "JOUW-EAS-PROJECT-ID", // ← aanpassen na `eas init`
    },
  },
});
