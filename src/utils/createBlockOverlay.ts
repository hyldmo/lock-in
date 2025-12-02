export function createBlockOverlay(flashEnabled: boolean, customMessage?: string): HTMLDivElement {
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
		zIndex: '2147483647',
		fontFamily: 'Impact, sans-serif',
		fontSize: '10vw',
		textAlign: 'center',
		textTransform: 'uppercase'
	})

	overlay.innerText = customMessage || 'YOU NEED TO LOCK IN'

	if (flashEnabled) {
		const style = document.createElement('style')
		style.textContent = `
			@keyframes flash {
				0% { background-color: black; color: white; }
				50% { background-color: white; color: black; }
				100% { background-color: black; color: white; }
			}
			.flashing {
				animation: flash 0.5s steps(1, end) infinite;
			}
		`
		overlay.appendChild(style)
		overlay.classList.add('flashing')
	}

	return overlay
}
