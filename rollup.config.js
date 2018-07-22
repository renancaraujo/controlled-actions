import babel from 'rollup-plugin-babel';
import flow from 'rollup-plugin-flow';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/umd/index.js',
      format: 'umd',
      indent: '  ',
      name: 'moduleName',
    },
  ],
  plugins: [
    resolve({
      module: true,
      jsnext: true,
      browser: true,
    }),
    flow(),
    
    babel(),
    
  ],
};
