module.exports = {
  chainWebpack: config => {
    config.devtool('source-map');

    /**
     * Sorts the mess of source maps.
     */
    config.output.devtoolModuleFilenameTemplate(info => {
      // This is what I used to determine the rules below. It outputs a ton of information so you can figure out how to
      // distinguish between the files you want and the ones you don't.
      // return `webpack://${info.resourcePath}?path=${info.resourcePath},query=${info.query},loaders=${info.allLoaders},hash=${info.hash}`;

      if(info.resourcePath.endsWith('.vue')) { // do some special processing for .vue files

        // the <script> block from vue files. this is where you put script breakpoints.
        if (
            info.query.startsWith('?vue&type=script') && // only the script section
            !info.allLoaders.includes('babel')           // don't use the one from babel
        ) {
          return `src://${info.resourcePath}?script`;
        }

        // the full vue file. You can't put script breakpoints here, but you can put render breakpoints here.
        if (
            info.query === '' && info.allLoaders === '' // no extra processing? I dunno, but it works
        ) {
          return `src://${info.resourcePath}?render`;
        }

      } else if(
          info.resourcePath.startsWith('./src') // this path may depend on your project configuration
      ) {
        return `src://${info.resourcePath}?${info.hash}`;
      }

      return `webpack:///${info.resourcePath}?${info.hash}`;
    });
  }
}