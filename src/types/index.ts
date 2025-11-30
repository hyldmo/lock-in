export interface SiteBlock {
	domain: string
	pathExceptions: string[]
	allowAllSubpaths?: boolean
}

export interface Schedule {
	startTime: string // "HH:MM"
	endTime: string // "HH:MM"
	days: number[] // 0-6 (Sunday-Saturday)
}

export interface Settings {
	blockedSites: SiteBlock[]
	schedule: Schedule
	flashEnabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
	blockedSites: [],
	schedule: {
		startTime: '09:00',
		endTime: '17:00',
		days: [1, 2, 3, 4, 5] // Mon-Fri
	},
	flashEnabled: false
}
