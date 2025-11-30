/** @type {import('semantic-release').GlobalConfig} */
export default {
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'angular',
				parserOpts: {
					headerPattern: /^(\w*|Update):? (.*)$/,
					headerCorrespondence: ['type', 'message'],
					mergePattern: /^Merge pull request #(\\d+) from (.*)$/,
					mergeCorrespondence: ['id', 'source']
				},
				releaseRules: [
					{
						type: 'Update',
						release: 'patch'
					}
				]
			}
		],
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/github',
			{
				assets: [
					{
						path: process.env.RELEASE_PATH || 'dry-run.zip',
						label: `Chrome Web Extension v${process.env.VERSION}`
					}
				]
			}
		]
	]
}

