import babel from 'rollup-plugin-babel';
import flow from 'rollup-plugin-flow';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/umd/index.js',
      format: 'umd',
      name: 'controlledtActions',
    },
  ],
  plugins: [
    flow(),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/lodash/isequal.js': ['isEqual'],
      },
    }),
    nodeResolve({
      jsnext: true,
      main: true,
    }),
    babel(),
  ],
};
