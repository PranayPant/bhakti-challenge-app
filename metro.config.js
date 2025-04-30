const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = wrapWithReanimatedMetroConfig(getDefaultConfig(__dirname));

module.exports = withNativeWind(config, { input: "./global.css" });
