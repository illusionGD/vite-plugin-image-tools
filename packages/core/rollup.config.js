import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
/** @type {import('rollup').RollupOptions[]} */

export default {
  input: `src/index.ts`,
  output: [
    {
      dir: 'dist',
      entryFileNames: 'esm/[name].js',
      format: 'esm',
      sourcemap: true
    },
    {
        dir: 'dist',
        entryFileNames: 'cjs/[name].js',
        format: 'cjs',
        sourcemap: true
    }
  ],
  plugins: [
    json(),
    commonjs(),
    resolve({
      preferBuiltins: false
    }),
    babel({ babelHelpers: 'bundled' }),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser()
  ],
  external: ['fs', 'path', 'crypto', 'sharp','spritesmith','sass']
}
