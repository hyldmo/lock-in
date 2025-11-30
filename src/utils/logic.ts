import type { Schedule, Settings } from '../types/index'

export function isWithinSchedule(schedule: Schedule): boolean {
	const now = new Date()
	const currentDay = now.getDay()
	const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')

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

export function shouldBlock(url: string, settings: Settings): boolean {
	if (!isWithinSchedule(settings.schedule)) {
		return false
	}

	try {
		const urlObj = new URL(url)
		const hostname = urlObj.hostname.replace(/^www\./, '')
		const pathname = urlObj.pathname

		// Check if domain matches any blocked site
		// We match if the hostname ends with the blocked domain (e.g. sub.facebook.com matches facebook.com)
		// or is exact match
		const matchedBlock = settings.blockedSites.find(site => {
			return hostname === site.domain || hostname.endsWith('.' + site.domain)
		})

		if (!matchedBlock) {
			return false
		}

		// If allowAllSubpaths is enabled, allow all paths
		if (matchedBlock.allowAllSubpaths) {
			return false
		}

		// Check exceptions
		// If any exception path is a prefix of the current path, allow it
		const isAllowed = matchedBlock.pathExceptions.some(exception => {
			// clean exception path
			const cleanEx = exception.startsWith('/') ? exception : '/' + exception
			return pathname.startsWith(cleanEx)
		})

		return !isAllowed
	} catch (e) {
		console.error('Error parsing URL:', e)
		return false
	}
}
