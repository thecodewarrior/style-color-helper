module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(glsl|vert|frag)$/,
          use: ['raw-loader']
        }
      ],
    },
  },
  chainWebpack: config => {
    config.devtool('source-map');
    config.output.devtoolModuleFilenameTemplate(info => {
      let filename = `webpack:///${info.resourcePath}?${info.hash}`
      if(info.resourcePath.startsWith('./src')) {
        filename = 'src://' + info.resourcePath.substring(2);
      }
      return filename;
    })

    config.output.devtoolFallbackModuleFilenameTemplate = 'webpack://[resource-path]?[hash]'
  }
}