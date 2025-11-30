import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import { createManifest } from './manifest.config'
import pkg from './package.json'
import { crxPack } from './vite-plugin-crx-pack'

export default defineConfig(({ mode }) => {
	const version = process.env.PACKAGE_VERSION || pkg.version.replace('-development', '')
	const manifest = createManifest({ name: startCase(pkg.name), version, description: pkg.description })
	return {
		resolve: {
			alias: {
				'@': `${path.resolve(__dirname, 'src')}`
			}
		},
		plugins: [
			tailwindcss(),
			svelte({
				compilerOptions: {
					dev: mode === 'development'
				}
			}),
			crx({ manifest }),
			zip({ outDir: 'release', outFileName: `crx-${pkg.name}-${version}.zip` }),
			crxPack({
				outDir: 'release',
				outFileName: `${pkg.name}-${version}.crx`,
				pem: process.env.CRX_PRIVATE_KEY
			})
		],
		server: {
			cors: {
				origin: [/chrome-extension:\/\//]
			}
		}
	}
})

function startCase(str: string) {
	return str
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}
