const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");
const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];

const nativeWindConfig = withNativeWind(defaultConfig, {
  input: "./global.css",
});

const reanimatedConfig = wrapWithReanimatedMetroConfig(nativeWindConfig);

module.exports = reanimatedConfig;
