import type { PathRule, Schedule, Settings } from '../types/index'
import { log } from './log'

export function isWithinSchedule(schedule: Schedule): boolean {
	const now = new Date()
	const currentDay = now.getDay()
	const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

	// Check day
	if (!schedule.days.includes(currentDay)) {
		return false
	}

	// Check time range
	// Handle overnight ranges (e.g. 22:00 to 06:00)
	if (schedule.startTime > schedule.endTime) {
		return currentTime >= schedule.startTime || currentTime <= schedule.endTime
	}

	return currentTime >= schedule.startTime && currentTime <= schedule.endTime
}

function globToRegex(glob: string): RegExp {
	// Escape regex characters except * and ?
	const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&')
	// Convert glob patterns to regex
	// * matches zero or more characters
	// ? matches exactly one character
	const pattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.')
	return new RegExp(`^${pattern}$`)
}

function matchesPath(pathname: string, rule: PathRule): boolean {
	const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname

	if (rule.type === 'regex') {
		try {
			const regex = new RegExp(rule.value)
			return regex.test(normalizedPath)
		} catch {
			return false
		}
	}

	if (rule.type === 'glob') {
		try {
			// Ensure glob starts with / if the path does (usually paths do)
			// But glob might be "*".
			// If rule.value doesn't start with /, and we are matching against pathname which does...
			// For simplicity, let's rely on the user providing the correct glob.
			const regex = globToRegex(rule.value)
			return regex.test(normalizedPath)
		} catch {
			return false
		}
	}

	// String matching: exact match or prefix match
	const normalizedPattern = rule.value.endsWith('/') && rule.value.length > 1 ? rule.value.slice(0, -1) : rule.value
	const cleanPattern = normalizedPattern.startsWith('/') ? normalizedPattern : `/${normalizedPattern}`

	// Exact match
	if (normalizedPath === cleanPattern) return true

	// Prefix match (only if pattern is not just "/")
	if (cleanPattern !== '/' && normalizedPath.startsWith(`${cleanPattern}/`)) return true

	return false
}

export function shouldBlock(url: string, settings: Settings): boolean {
	if (!isWithinSchedule(settings.schedule)) {
		return false
	}

	try {
		const urlObj = new URL(url)
		const hostname = urlObj.hostname.replace(/^www\./, '')
		const pathname = urlObj.pathname

		// We match if the hostname ends with the blocked domain (e.g. sub.facebook.com matches facebook.com)
		const matchedBlock = settings.blockedSites.find(site => {
			return hostname === site.domain || hostname.endsWith(`.${site.domain}`)
		})

		if (!matchedBlock) {
			return false
		}

		const rules = matchedBlock.paths || []

		if (matchedBlock.listType === 'blacklist') {
			return rules.some(rule => matchesPath(pathname, rule))
		}

		// Whitelist (default behavior)
		const isAllowed = rules.some(rule => {
			return matchesPath(pathname, rule)
		})

		return !isAllowed
	} catch (e) {
		log.debugError('Error parsing URL:', e)
		return false
	}
}

export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') {
		return false
	}

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
	return !prefersReducedMotion.matches
}
