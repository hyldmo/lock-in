export default {
	branches: ['main'],
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'conventionalcommits',
				releaseRules: [
					{ type: 'docs', scope: 'README', release: 'patch' },
					{ type: 'refactor', release: 'patch' },
					{ type: 'style', release: 'patch' }
				]
			}
		],
		[
			'@semantic-release/release-notes-generator',
			{
				preset: 'conventionalcommits',
				presetConfig: {
					types: [
						{ type: 'feat', section: 'Features' },
						{ type: 'fix', section: 'Bug Fixes' },
						{ type: 'chore', section: 'Miscellaneous' },
						{ type: 'docs', section: 'Documentation' },
						{ type: 'refactor', section: 'Refactor' },
						{ type: 'style', section: 'Styles' },
						{ type: 'test', section: 'Tests' },
						{ type: 'perf', section: 'Performance' }
					]
				}
			}
		],
		[
			'@semantic-release/github',
			{
				assets: [
					{ path: 'release/*.zip', label: 'Chrome Web Extension (zip)' },
					{ path: 'release/*.crx', label: 'Chrome Web Extension (crx)' }
				]
			}
		]
	]
}
