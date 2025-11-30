import type { GlobalConfig } from 'semantic-release'
export default {
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				'preset': 'angular',
				'releaseRules': [
					{ 'type': 'docs', 'scope': 'README', 'release': 'patch' },
					{ 'type': 'refactor', 'release': 'patch' },
					{ 'type': 'style', 'release': 'patch' }
				],
				'parserOpts': {
					'noteKeywords': ['BREAKING CHANGE', 'BREAKING CHANGES']
				}
			}
		],
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
} satisfies Partial<GlobalConfig>
