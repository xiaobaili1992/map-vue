import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    minify: true, // 使用默认的 esbuild 压缩，体积最小
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'index',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        'element-plus',
        '@element-plus/icons-vue',
        '@antv/l7',
        '@antv/l7-maps',
        'geotiff',
        'proj4',
        'gcoord',
      ],
      output: {
        compact: true, // 开启 Rollup 的紧凑模式
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          '@antv/l7': 'L7',
          '@antv/l7-maps': 'L7Maps',
          geotiff: 'GeoTIFF',
          proj4: 'proj4',
          gcoord: 'gcoord',
        },
        exports: 'named',
      },
    },
  },
});
