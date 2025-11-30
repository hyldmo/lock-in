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
		// 1. Register for future navigations
		await chrome.scripting.registerContentScripts([
			{
				id: 'lock-in-blocker',
				js: [contentScriptPath],
				matches: matches,
				runAt: 'document_start'
			}
		])

		// 2. Inject into existing tabs immediately
		const tabs = await chrome.tabs.query({ url: matches })
		for (const tab of tabs) {
			if (tab.id) {
				try {
					await chrome.scripting.executeScript({
						target: { tabId: tab.id },
						files: [contentScriptPath]
					})
				} catch (e) {
					// Ignore errors (e.g. cannot access restricted tabs)
					console.warn(`Failed to inject into tab ${tab.id}`, e)
				}
			}
		}
	} catch (err) {
		console.error('Failed to update content scripts:', err)
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
