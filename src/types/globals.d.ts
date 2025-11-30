declare global {
	export interface Window {
		// Add global window properties here
	}
}

declare module '*.svelte' {
	export { SvelteComponent as default } from 'svelte'
}

export {}
