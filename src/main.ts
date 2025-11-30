import { DEFAULT_SETTINGS, type Settings } from './types'
import { createBlockOverlay, shouldBlock } from './utils'

let currentSettings: Settings = DEFAULT_SETTINGS

function enforceBlock(flashEnabled: boolean) {
	// Stop further loading
	window.stop()

	// Function to create and show overlay
	const showBlock = () => {
		// Replace content
		document.documentElement.innerHTML = ''

		// Create overlay
		const overlay = createBlockOverlay(flashEnabled)

		// Append to body or documentElement if body doesn't exist yet
		if (document.body) {
			document.body.appendChild(overlay)
		} else {
			document.documentElement.appendChild(overlay)
		}
	}

	// Show immediately if DOM is ready, otherwise wait
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', showBlock)
	} else {
		showBlock()
	}
}

function checkAndBlock() {
	if (shouldBlock(window.location.href, currentSettings)) {
		enforceBlock(currentSettings.flashEnabled)
	}
}

// Intercept history API calls (pushState, replaceState)
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function (...args) {
	originalPushState.apply(history, args)
	checkAndBlock()
}

history.replaceState = function (...args) {
	originalReplaceState.apply(history, args)
	checkAndBlock()
}

// Listen for popstate (back/forward navigation)
window.addEventListener('popstate', checkAndBlock)

// Listen for hash changes
window.addEventListener('hashchange', checkAndBlock)

// Intercept link clicks
document.addEventListener('click', (e) => {
	const target = e.target as HTMLElement
	const link = target.closest('a')
	if (link && link.href) {
		try {
			const url = new URL(link.href)
			// Only intercept same-origin navigation
			if (url.origin === window.location.origin) {
				// Small delay to let navigation happen, then check
				setTimeout(checkAndBlock, 100)
			}
		} catch {
			// Invalid URL, ignore
		}
	}
}, true)

// Main execution - check settings and block if needed
chrome.storage.sync.get('settings', result => {
	currentSettings = (result.settings as Settings) || DEFAULT_SETTINGS

	// Check immediately
	checkAndBlock()
})

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
	if (changes.settings) {
		currentSettings = (changes.settings.newValue as Settings) || DEFAULT_SETTINGS
		checkAndBlock()
	}
})
