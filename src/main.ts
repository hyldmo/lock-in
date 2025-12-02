import { DEFAULT_SETTINGS, type Settings } from './types'
import { createBlockOverlay, shouldBlock } from './utils'

let currentSettings: Settings = DEFAULT_SETTINGS

function enforceBlock(flashEnabled: boolean) {
	// Stop further loading
	window.stop()

	const showBlock = () => {
		document.documentElement.innerHTML = ''
		const overlay = createBlockOverlay(flashEnabled)
		if (document.body) {
			document.body.appendChild(overlay)
		} else {
			document.documentElement.appendChild(overlay)
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', showBlock)
	} else {
		showBlock()
	}
}

function checkAndBlock(url: string = window.location.href) {
	if (shouldBlock(url, currentSettings)) {
		enforceBlock(currentSettings.flashEnabled)
	}
}

if ('navigation' in window && window.navigation) {
	window.navigation.addEventListener('navigate', e => {
		if (e.destination?.url) {
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
	currentSettings = (result.settings as Settings) || DEFAULT_SETTINGS
	checkAndBlock()
})

// Listen for settings changes
chrome.storage.onChanged.addListener(changes => {
	if (changes.settings) {
		currentSettings = (changes.settings.newValue as Settings) || DEFAULT_SETTINGS
		checkAndBlock()
	}
})
