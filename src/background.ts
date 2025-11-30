import contentScriptPath from './main?script'
import { DEFAULT_SETTINGS, type Settings } from './types'

// Open options page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
	chrome.runtime.openOptionsPage()
})

async function updateContentScripts(settings: Settings) {
	const domains = settings.blockedSites.map(s => s.domain)

	// Always unregister first to ensure clean state
	try {
		await chrome.scripting.unregisterContentScripts({ ids: ['lock-in-blocker'] })
	} catch {
		// Ignore error if script doesn't exist
	}

	if (domains.length === 0) return

	const matches = domains.flatMap(domain => [`*://${domain}/*`, `*://*.${domain}/*`])

	try {
		await chrome.scripting.registerContentScripts([
			{
				id: 'lock-in-blocker',
				js: [contentScriptPath],
				matches: matches,
				runAt: 'document_start'
			}
		])
	} catch (err) {
		console.error('Failed to register content scripts:', err)
	}
}

// Listen for settings changes
chrome.storage.onChanged.addListener(changes => {
	if (changes.settings) {
		const settings = changes.settings.newValue as Settings
		updateContentScripts(settings)
	}
})

// Initial registration
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.get('settings', result => {
		updateContentScripts((result.settings as Settings) || DEFAULT_SETTINGS)
	})
})

chrome.runtime.onStartup.addListener(() => {
	chrome.storage.sync.get('settings', result => {
		updateContentScripts((result.settings as Settings) || DEFAULT_SETTINGS)
	})
})
