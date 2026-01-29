export type Theme = 'light' | 'dark'

export function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme | 'system') {
	if (typeof document === 'undefined') return

	const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
	const html = document.documentElement

	if (effectiveTheme === 'dark') {
		html.classList.add('dark')
	} else {
		html.classList.remove('dark')
	}

	// Sync to localStorage for inline script flash prevention
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('theme', effectiveTheme)
	}
}

export function watchSystemTheme(callback: (theme: Theme) => void) {
	if (typeof window === 'undefined') {
		// Return a no-op function when window is undefined (SSR)
		return () => {
			// No-op
		}
	}

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
	const handler = (e: MediaQueryListEvent) => {
		callback(e.matches ? 'dark' : 'light')
	}

	mediaQuery.addEventListener('change', handler)
	return () => mediaQuery.removeEventListener('change', handler)
}
