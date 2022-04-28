const { resolve } = require ('path')
// const visualizer = require ('rollup-plugin-visualizer')

module.exports = {
  base: '/common-scandi-names/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 100,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        performance: resolve(__dirname, 'performance.html')
      }
    //   plugins: [
    //     visualizer (opts => ({
    //       template: 'sunburst', // sunburst|treemap|network
    //       gzipSize: true,
    //       open: true,
    //       sourcemap: true
    //     }))
    //   ]
    }
  }
}
