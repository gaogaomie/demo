import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { defineConfig } from 'umi';
import routes from './routes';

export default defineConfig({
  antd: {
    // configProvider
    configProvider: {},
    // themes
    dark: true,
    compact: true,
    // babel-plugin-import
    import: true,
    // less or css, default less
    style: 'less',
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    // 支持任何不需要 dom 的
    // https://procomponents.ant.design/components/layout#prolayout
    name: 'Ant Design',
    locale: true,
    layout: 'side',
  },
  routes,
  npmClient: 'npm',
  chainWebpack: (config, { webpack }) => {
    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        languages: ['javascript', 'sql', 'json'],
        features: [
          'comment', //备注
          'format', //格式化
          'fontZoom', //放大
          'folding',
          'codelens',
          'suggest',
          'wordOperations',
          'wordPartOperations',
          'wordHighlighter',
          'parameterHints',
          'bracketMatching',
          'find',
          'linesOperations',
          'coreCommands',
        ],
      },
    ]);
  },
});
