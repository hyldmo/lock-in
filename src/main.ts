import { DEFAULT_SETTINGS, migrateSettings, type Settings } from './types'
import { createBlockOverlay, log, shouldBlock } from './utils'

let currentSettings: Settings = DEFAULT_SETTINGS

function enforceBlock(settings: Settings) {
	log.debug('Enforcing block')

	const overlay = createBlockOverlay(settings.flashEnabled, settings.customBlockMessage)
	const parent = document.body || document.documentElement
	parent.appendChild(overlay)
}

function checkAndBlock(url: string = window.location.href) {
	log.debug(`Checking URL: ${url}`)
	if (shouldBlock(url, currentSettings)) {
		log.debug(`Should block: ${url}`)
		enforceBlock(currentSettings)
	} else {
		log.debug(`Allowed: ${url}`)
	}
}

if ('navigation' in window && window.navigation) {
	window.navigation.addEventListener('navigate', e => {
		if (e.destination?.url) {
			log.debug(`Navigation event to: ${e.destination.url}`)
			checkAndBlock(e.destination.url)
		}
	})
} else {
	// Fallback for older browsers
	const originalPushState = history.pushState
	const originalReplaceState = history.replaceState

	history.pushState = (...args) => {
		originalPushState.apply(history, args)
		checkAndBlock()
	}

	history.replaceState = (...args) => {
		originalReplaceState.apply(history, args)
		checkAndBlock()
	}

	window.addEventListener('popstate', () => checkAndBlock())
	window.addEventListener('hashchange', () => checkAndBlock())
}

// Main execution
chrome.storage.sync.get('settings', result => {
	log.debug(`Loaded settings: ${result.settings}`)
	currentSettings = migrateSettings(result.settings as Settings)
	checkAndBlock()
})

// Listen for settings changes
chrome.storage.onChanged.addListener(changes => {
	if (changes.settings) {
		log.debug(`Settings changed: ${changes.settings.newValue}`)
		currentSettings = migrateSettings(changes.settings.newValue as Settings)
		checkAndBlock()
	}
})
