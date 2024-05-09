// rollup.config.mjs
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify'

import pkg from './package.json' assert { type: 'json' }

const defineLib = ({ input, outputName }) => {
  /** @type {import('rollup').RollupOptions} */
  return [
    {
      input,
      external: ['vscode'],
      output: [
        { file: `dist/${outputName}.cjs.js`, format: 'cjs' },
        { file: `dist/${outputName}.esm.js`, format: 'es' }
      ],
      plugins: [
        resolve(),
        typescript(),
        commonjs(), // so Rollup can convert `ms` to an ES module
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        // ...(process.env.NODE_ENV === 'development' ? [] : [terser(), uglify()])
      ]
    },

    // 声明
    {
      input,
      external: ['vscode'],
      output: [
        {
          file: `dist/${outputName}.d.ts`,
          format: 'es'
        }
      ],
      plugins: [resolve(), dts()]
    }
  ]
}
/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: 'src/browser.ts',
    output: {
      name: 'lowdb',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      file: pkg.browser,
      format: 'umd'
    },
    // external: ['vscode'],
    plugins: [
      typescript(),
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      ...(process.env.NODE_ENV === 'development' ? [] : [terser(), uglify()])
    ]
  },
  ...defineLib({ input: 'src/browser.ts', outputName: 'browser' }),
  ...defineLib({ input: 'src/index.ts', outputName: 'index' }),
  ...defineLib({ input: 'src/node.ts', outputName: 'node' })
]
