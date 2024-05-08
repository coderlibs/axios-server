import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
export default {
  input: 'src/service.ts', // 输入文件
  output: {
    name: 'Axios-Server',
    file: 'libs/index.js', // 输出文件
    format: 'umd' // 打包格式，这里以CommonJS为例
  },
  plugins: [
    babel({
        exclude:'node_modules/**'
    }),
    commonjs(),  //  自动匹配index文件
    typescript(), // 解析ts
  ]
};