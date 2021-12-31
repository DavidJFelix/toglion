const swc = require('@swc/core')
const esbuild = require('esbuild')

// swc.bundle({
//   entry: '../api/src/functions/onGlobalTableChange/handler.ts',
//   outdir: '../api/pit',
//   options: {
//     jsc: {
//       baseUrl: '../api/',
//       parser: {
//         syntax: 'typescript',
//       },
//     },
//     sourceMaps: true,
//     module: {
//       type: 'commonjs',
//     },
//   },
// })

esbuild.buildSync({
  entryPoints: ['../api/src/functions/onGlobalTableChange/handler.ts'],
  bundle: true,
  platform: 'node',
  sourcemap: true,
  treeShaking: true,
  outdir: '../api/out',
  outbase: '../api',
})
