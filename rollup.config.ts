import typescript from '@rollup/plugin-typescript'
import type { RollupOptions } from 'rollup'
import copy from 'rollup-plugin-copy'

const config: RollupOptions = {
	input: {
		main: 'src/main.ts',
		background: 'src/background.ts',
		options: 'src/options/options.ts'
	},
	output: {
		sourcemap: true,
		dir: 'dist',
		format: 'es',
		entryFileNames: '[name].js',
		chunkFileNames: 'shared.js',
		manualChunks: undefined
	},
	plugins: [
		typescript({
			sourceMap: true,
			exclude: ['rollup.config.ts', '**/*.config.ts', 'rollup.config-*.mjs']
		}),
		copy({
			targets: [
				{ src: 'manifest.json', dest: 'dist/' },
				{ src: 'images/**/*', dest: 'dist/images/' },
				{ src: 'src/options/options.html', dest: 'dist/' },
				{ src: 'src/options/options.css', dest: 'dist/' }
			]
		})
	]
}

export default config
