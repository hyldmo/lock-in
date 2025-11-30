import { defineManifest } from '@crxjs/vite-plugin'
import type pkg from './package.json'
export type Package = Pick<typeof pkg, 'name' | 'version' | 'description'>

export function createManifest(config: Package) {
	return defineManifest({
		manifest_version: 3,
		name: config.name,
		version: config.version,
		description: config.description,
		icons: {
			'16': 'images/logo-16.png',
			'32': 'images/logo-32.png',
			'48': 'images/logo-48.png',
			'128': 'images/logo-128.png'
		},
		action: {
			default_title: 'Lock In',
			default_icon: {
				'16': 'images/logo-16.png',
				'32': 'images/logo-32.png',
				'48': 'images/logo-48.png',
				'128': 'images/logo-128.png'
			}
		},
		options_ui: {
			page: 'src/options/index.html',
			open_in_tab: true
		},
		permissions: ['scripting', 'storage'],
		host_permissions: [],
		optional_host_permissions: ['<all_urls>'],
		background: {
			service_worker: 'src/background.ts'
		}
	})
}
