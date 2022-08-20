import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import zlib from 'node:zlib'

const types = ['main', 'decode', 'encode', 'both']

for (const t of types) {
  console.log(`== ${t} ==`)
  const nonTerserBundle = await rollup({
    input: `src/${t}.js`,
    plugins: [nodeResolve()]
  })
  const nonTerserGenerated = await nonTerserBundle.generate({ format: 'esm' })
  const nonTerserRawSize = Buffer.byteLength(
    nonTerserGenerated.output[0].code,
    'utf8'
  )

  const bundle = await rollup({
    input: `src/${t}.js`,
    plugins: [nodeResolve(), terser()]
  })

  const generated = await bundle.generate({ format: 'esm' })

  const code = generated.output[0].code
  const rawSize = Buffer.byteLength(code, 'utf8')
  const gzipSize = zlib.gzipSync(code, { level: 9 }).byteLength
  const brotliSize = zlib.brotliCompressSync(code, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
    }
  }).byteLength

  console.log(
    `raw(non terser): ${nonTerserRawSize}B, raw: ${rawSize}B, gzip: ${gzipSize}B, brotli: ${brotliSize}B`
  )

  // await bundle.write({
  //   dir: `dist/${t}`,
  //   format: 'esm'
  // })
}
