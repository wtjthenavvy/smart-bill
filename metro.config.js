const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 关键修复：把 'wasm' 添加到资源扩展名列表中
// 这样 Metro 打包时就会识别它，而不是报错
config.resolver.assetExts.push('wasm');
config.resolver.assetExts.push('db'); // 以防万一，把 db 文件也加进去

module.exports = config;