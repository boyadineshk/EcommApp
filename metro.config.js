const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude backend folder from bundling
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /backend\/.*/,  // Block entire backend folder
  /node_modules\/.*\/server\.js$/,  // Block any server.js files
];

module.exports = config;