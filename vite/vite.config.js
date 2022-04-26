import { visualizer } from "rollup-plugin-visualizer"

export default {
  base: '/common-scandi-names/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 100,
    sourcemap: true,
    // rollupOptions: {
    //   plugins: [
    //     visualizer (opts => ({
    //       template: 'sunburst', // sunburst|treemap|network
    //       gzipSize: true,
    //       open: true,
    //       sourcemap: true
    //     }))
    //   ]
    // }
  }
}
