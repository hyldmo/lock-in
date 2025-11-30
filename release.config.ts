import type { GlobalConfig } from 'semantic-release'
export default {
	branches: ['main'],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/github',
			{
				assets: [
					{
						path: `${process.env.RELEASE_PATH}.zip`,
						label: `Chrome Web Extension v${process.env.VERSION}`
					},
					{
						path: `${process.env.RELEASE_PATH}.crx`,
						label: `Chrome Web Extension .crx v${process.env.VERSION}`
					}
				]
			}
		]
	]
} satisfies GlobalConfig
