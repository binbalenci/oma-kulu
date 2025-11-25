const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// Exclude test files from Metro bundler
config.resolver = {
  ...config.resolver,
  blockList: [
    /\/__tests__\/.*/,
    /.*\.test\.[jt]sx?$/,
    /.*\.spec\.[jt]sx?$/,
  ],
};

module.exports = config;
