import type { Options } from "tsup";
// import * as nodeGlobals from '@esbuild-plugins/node-globals-polyfill'
// import * as nodeModules from '@esbuild-plugins/node-modules-polyfill'

export const tsup: Options = {
  splitting: false,
  dts: true,
  sourcemap: true,
  clean: true,
  entryPoints: ["src/index.ts"],
  // TODO : Support Browser
  // esbuildPlugins: [
  //   nodeModules.NodeModulesPolyfillPlugin(),
  //   nodeGlobals.NodeGlobalsPolyfillPlugin({ buffer: true })
  // ],
  // define: {
  //   window: 'self',
  //   global: 'self'
  // },
};