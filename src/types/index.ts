import { prefersReducedMotion } from '../utils/logic'

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

export interface Settings {
	blockedSites: SiteBlock[]
	/** @deprecated Use schedules instead */
	schedule?: Schedule
	schedules: Schedule[]
	flashEnabled: boolean
	customBlockMessage: string
}

export const DEFAULT_SETTINGS: Settings = {
	blockedSites: [],
	schedules: [
		{
			startTime: '09:00',
			endTime: '17:00',
			days: [1, 2, 3, 4, 5], // Mon-Fri
			allDay: false
		}
	],
	flashEnabled: prefersReducedMotion(),
	customBlockMessage: ''
}

export function migrateSettings(settings: Settings): Settings {
	if (!settings) {
		return DEFAULT_SETTINGS
	}

	if (settings.schedule) {
		const { schedule, ...rest } = settings
		const migrated = {
			...DEFAULT_SETTINGS,
			...rest,
			schedules: [schedule]
		}
		if (typeof chrome !== 'undefined' && chrome.storage) {
			chrome.storage.sync.set({ settings: migrated })
		}
		return migrated
	}

	if (!(settings.schedules && Array.isArray(settings.schedules))) {
		return {
			...DEFAULT_SETTINGS,
			...settings,
			schedules: DEFAULT_SETTINGS.schedules
		}
	}

	return {
		...DEFAULT_SETTINGS,
		...settings
	}
}
