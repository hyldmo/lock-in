import { DEFAULT_SETTINGS, type Settings } from './types/index'
import { shouldBlock } from './utils/logic'

// Main execution
chrome.storage.sync.get('settings', result => {
	const settings = (result.settings as Settings) || DEFAULT_SETTINGS

	// Check immediately
	if (shouldBlock(window.location.href, settings)) {
		enforceBlock(settings.flashEnabled)
	}
})

function enforceBlock(flashEnabled: boolean) {
	// Stop further loading
	window.stop()

	// Replace content
	document.documentElement.innerHTML = ''

	// Create overlay
	const overlay = document.createElement('div')
	Object.assign(overlay.style, {
		position: 'fixed',
		top: '0',
		left: '0',
		width: '100vw',
		height: '100vh',
		backgroundColor: 'black',
		color: 'white',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: '2147483647', // Max int
		fontFamily: 'Impact, sans-serif',
		fontSize: '10vw',
		textAlign: 'center',
		textTransform: 'uppercase'
	})

	overlay.innerText = 'YOU NEED TO LOCK IN'

	if (flashEnabled) {
		const style = document.createElement('style')
		style.textContent = `
            @keyframes flash {
                0% { background-color: black; color: white; }
                50% { background-color: white; color: black; }
                100% { background-color: black; color: white; }
            }
            .flashing {
                animation: flash 0.5s infinite;
            }
        `
		document.head.appendChild(style)
		overlay.classList.add('flashing')
	}

	document.body.appendChild(overlay)
}
