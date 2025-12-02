declare global {
	export interface Window {
		navigation: Navigation | undefined
	}

	interface Navigation extends EventTarget {
		addEventListener(
			type: 'navigate',
			listener: (event: NavigateEvent) => void,
			options?: boolean | AddEventListenerOptions
		): void
		removeEventListener(
			type: 'navigate',
			listener: (event: NavigateEvent) => void,
			options?: boolean | EventListenerOptions
		): void
	}

	interface NavigateEvent extends Event {
		destination: NavigationDestination
		canIntercept: boolean
		userInitiated: boolean
		hashChange: boolean
		signal: AbortSignal
		downloadRequest: string | null
		formData: FormData | null
		info?: unknown
		intercept(options?: NavigationInterceptOptions): void
		scroll(): void
	}

	interface NavigationDestination {
		url: string
		key: string
		id: string
		index: number
		sameDocument: boolean
	}

	interface NavigationInterceptOptions {
		handler?: () => void | Promise<void>
		focusReset?: 'after-transition' | 'manual'
		scroll?: 'after-transition' | 'manual'
	}
}

declare module '*?script' {
	const content: string
	export default content
}

declare module '*.svelte' {
	export { SvelteComponent as default } from 'svelte'
}
