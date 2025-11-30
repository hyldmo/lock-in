declare global {
	export interface Window {
		// Add global window properties here
	}
}

declare module '*?script' {
	const content: string
	export default content
}

declare module '*.svelte' {
	export { SvelteComponent as default } from 'svelte'
}
