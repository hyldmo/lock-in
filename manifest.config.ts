import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
	manifest_version: 3,
	name: startCase(pkg.name),
	version: process.env.PACKAGE_VERSION || '1.0.0',
	description: pkg.description,
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
	content_scripts: [
		{
			js: ['src/main.ts'],
			matches: ['<all_urls>']
		}
	],
	permissions: ['activeTab', 'scripting', 'storage'],
	background: {
		service_worker: 'src/background.ts'
	}
})

function startCase(str: string) {
	return str
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}
