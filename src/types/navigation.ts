export interface Navigation extends EventTarget {
	addEventListener(
		type: 'navigate',
		listener: (event: NavigateEvent) => void,
		options?: boolean | AddEventListenerOptions
	): void
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions
	): void
	removeEventListener(
		type: 'navigate',
		listener: (event: NavigateEvent) => void,
		options?: boolean | EventListenerOptions
	): void
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject | null,
		options?: boolean | EventListenerOptions
	): void
}

export interface NavigateEvent extends Event {
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

export interface NavigationDestination {
	url: string
	key: string
	id: string
	index: number
	sameDocument: boolean
}

export interface NavigationInterceptOptions {
	handler?: () => void | Promise<void>
	focusReset?: 'after-transition' | 'manual'
	scroll?: 'after-transition' | 'manual'
}
