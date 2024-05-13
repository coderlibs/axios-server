import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
export default {
  input: 'src/service.ts',
  output: {
    name: 'Axios-Server',
    file: 'libs/index.min.js', // 输出文件
    format: 'umd' // 打包格式，这里以CommonJS为例
  },
  plugins: [
    babel({
        exclude:'node_modules/**'
    }),
    commonjs(),  //  自动匹配index文件
    typescript(), // 解析ts
    terser() // 使用terser插件进行代码压缩
  ]
};