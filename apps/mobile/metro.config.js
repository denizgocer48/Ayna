// Monorepo-aware Metro config: apps/mobile consumes packages/shared as source,
// so Metro has to watch the workspace root and resolve hoisted node_modules.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Without this, a package hoisted to the root can be resolved twice and you get
// two copies of React in the bundle.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
