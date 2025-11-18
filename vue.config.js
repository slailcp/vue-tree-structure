const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  outputDir: "packages/dist",
  publicPath: "./",
  chainWebpack: config => {
    config.plugin('copy').use(require('copy-webpack-plugin'), [
      {
        patterns: [
          {
            from: path.resolve(__dirname, './src/api'),
            to: path.resolve(__dirname, `./public/api`),
            toType: 'dir'
          }
        ]
      }
    ]);
  }

})
