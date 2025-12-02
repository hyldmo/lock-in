import type { Navigation } from './navigation'

declare global {
	interface Window {
		navigation: Navigation | undefined
	}
}
