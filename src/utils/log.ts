/* biome-ignore-all lint/suspicious/noConsole: Allow to expose library logging */
type Args = Parameters<typeof console.debug>

export const log = {
	debug: (...args: Args) => {
		if (!import.meta.env.DEV) return
		console.debug(`[Lock In]`, ...args)
	},
	debugError: (...args: Args) => {
		if (!import.meta.env.DEV) return
		console.error(`[Lock In]`, ...args)
	},
	info: (...args: Args) => {
		console.info(`[Lock In]`, ...args)
	},
	warn: (...args: Args) => {
		console.warn(`[Lock In]`, ...args)
	},
	error: (...args: Args) => {
		console.error(`[Lock In]`, ...args)
	}
}
