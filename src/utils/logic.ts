import type { Schedule, Settings } from '../types/index'

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

function matchesPath(pathname: string, pattern: string): boolean {
	const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname

	// Check if pattern is a regex (starts and ends with /)
	const isRegex = pattern.startsWith('/') && pattern.endsWith('/') && pattern.length > 2
	if (isRegex) {
		try {
			const regexPattern = pattern.slice(1, -1) // Remove leading and trailing /
			const regex = new RegExp(regexPattern)
			return regex.test(normalizedPath)
		} catch {
			// Invalid regex, fall back to string matching
			return false
		}
	}

	// String matching: exact match or prefix match
	const normalizedPattern = pattern.endsWith('/') && pattern.length > 1 ? pattern.slice(0, -1) : pattern
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

		if (matchedBlock.allowOnlySubpaths) {
			if (pathname === '/' || pathname === '') {
				return true
			}

			// Otherwise, check explicit blocks
			const isBlocked = matchedBlock.blockedPaths?.some(blockedPath => {
				return matchesPath(pathname, blockedPath)
			})
			return isBlocked || false
		}

		// Case 2: Allow all subpaths is DISABLED (Default Strict Mode)
		// Meaning: The site is generally BLOCKED, except for allowedPaths.

		const isAllowed = matchedBlock.allowedPaths.some(allowedPath => {
			return matchesPath(pathname, allowedPath)
		})

		return !isAllowed
	} catch (e) {
		console.error('Error parsing URL:', e)
		return false
	}
}
