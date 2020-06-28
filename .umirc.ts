import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  antd:{},
  dva:{
    immer: true,
    hmr: true,
  },
  /*routes: [
    { path: '/', component: '@/pages/index' },
  ],*/
});
