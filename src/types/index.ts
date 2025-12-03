export type PathRuleType = 'exact' | 'regex' | 'glob'

export interface PathRule {
	value: string
	type: PathRuleType
}

export interface SiteBlock {
	domain: string
	paths: PathRule[]
	listType: 'whitelist' | 'blacklist'
}

export interface Schedule {
	startTime: string // "HH:MM"
	endTime: string // "HH:MM"
	days: number[] // 0-6 (Sunday-Saturday)
	allDay?: boolean
}

import { prefersReducedMotion } from '../utils/logic'

export interface Settings {
	blockedSites: SiteBlock[]
	schedule: Schedule
	flashEnabled: boolean
	customBlockMessage: string
}

export const DEFAULT_SETTINGS: Settings = {
	blockedSites: [],
	schedule: {
		startTime: '09:00',
		endTime: '17:00',
		days: [1, 2, 3, 4, 5], // Mon-Fri
		allDay: false
	},
	flashEnabled: prefersReducedMotion(),
	customBlockMessage: ''
}
