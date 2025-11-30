import ChromeExtension from 'crx'
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

interface Options {
	outDir: string
	outFileName: string
	pem?: string
}

export function crxPack(options: Options): Plugin {
	return {
		name: 'vite-plugin-crx-pack',
		apply: 'build',
		async closeBundle() {
			const rootDir = process.cwd()
			const distDir = path.join(rootDir, 'dist')
			const outDir = path.resolve(rootDir, options.outDir)
			const keyPath = path.join(rootDir, 'key.pem')

			if (!fs.existsSync(distDir)) {
				console.error('dist/ directory not found, skipping crx pack.')
				return
			}

			if (!fs.existsSync(outDir)) {
				fs.mkdirSync(outDir, { recursive: true })
			}

			let privateKey: Buffer

			// 1. Try content provided in options
			if (options.pem) {
				privateKey = Buffer.from(options.pem, 'utf-8')
			}
			// 2. Try local file
			else if (fs.existsSync(keyPath)) {
				privateKey = fs.readFileSync(keyPath)
			}
			// 3. Generate new key (only if we can write to disk)
			else {
				console.log('Generating new private key (key.pem)...')
				try {
					const { execSync } = await import('node:child_process')
					execSync('openssl genrsa -out key.pem 2048', { cwd: rootDir })
					privateKey = fs.readFileSync(keyPath)
				} catch (e) {
					console.warn('Skipping CRX packing: Failed to find or generate private key.')
					return
				}
			}

			console.log('Packing extension to .crx...')
			const crx = new ChromeExtension({ privateKey })

			try {
				await crx.load(distDir)
				const crxBuffer = await crx.pack()

				const outputPath = path.join(outDir, options.outFileName)

				fs.writeFileSync(outputPath, crxBuffer)
				console.log(`Successfully created: ${outputPath}`)
			} catch (err) {
				console.error('Error packing extension:', err)
			}
		}
	}
}
