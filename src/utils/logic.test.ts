import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS, type Settings, type SiteBlock } from '../types'
import { isWithinSchedule, shouldBlock } from './logic'

// Mock system time for schedule tests
beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

describe('isWithinSchedule', () => {
	const schedule = {
		startTime: '09:00',
		endTime: '17:00',
		days: [1, 2, 3, 4, 5], // Mon-Fri
		allDay: false
	}

	it('should return true within working hours on a workday', () => {
		// Monday (1) at 10:00
		const date = new Date('2023-10-23T10:00:00')
		vi.setSystemTime(date)
		expect(date.getDay()).toBe(1)
		expect(isWithinSchedule(schedule)).toBe(true)
	})

	it('should return false outside working hours on a workday', () => {
		// Monday (1) at 18:00
		const date = new Date('2023-10-23T18:00:00')
		vi.setSystemTime(date)
		expect(isWithinSchedule(schedule)).toBe(false)
	})

	it('should return false on a non-workday', () => {
		// Sunday (0) at 10:00
		const date = new Date('2023-10-22T10:00:00')
		vi.setSystemTime(date)
		expect(date.getDay()).toBe(0)
		expect(isWithinSchedule(schedule)).toBe(false)
	})

	it('should handle overnight schedules', () => {
		const overnightSchedule = {
			...schedule,
			startTime: '22:00',
			endTime: '06:00'
		}

		// Monday 23:00 (In schedule)
		vi.setSystemTime(new Date('2023-10-23T23:00:00'))
		expect(isWithinSchedule(overnightSchedule)).toBe(true)

		// Monday 05:00 (In schedule)
		vi.setSystemTime(new Date('2023-10-23T05:00:00'))
		expect(isWithinSchedule(overnightSchedule)).toBe(true)

		// Monday 12:00 (Out of schedule)
		vi.setSystemTime(new Date('2023-10-23T12:00:00'))
		expect(isWithinSchedule(overnightSchedule)).toBe(false)
	})
})

describe('shouldBlock', () => {
	beforeEach(() => {
		// Set time to Monday 12:00 (active schedule) by default
		vi.setSystemTime(new Date('2023-10-23T12:00:00'))
	})

	it('should not block if outside schedule', () => {
		vi.setSystemTime(new Date('2023-10-23T20:00:00')) // Monday 20:00
		const settings = createSettings([{ domain: 'example.com', paths: [], listType: 'whitelist' }])
		expect(shouldBlock('https://example.com', settings)).toBe(false)
	})

	it('should not block if domain is not in blockedSites', () => {
		const settings = createSettings([{ domain: 'facebook.com', paths: [], listType: 'whitelist' }])
		expect(shouldBlock('https://google.com', settings)).toBe(false)
	})

	it('should match domain and subdomains', () => {
		const settings = createSettings([{ domain: 'example.com', paths: [], listType: 'whitelist' }])
		// Default behavior (whitelist empty): block everything
		expect(shouldBlock('https://example.com', settings)).toBe(true)
		expect(shouldBlock('https://www.example.com', settings)).toBe(true)
		expect(shouldBlock('https://sub.example.com', settings)).toBe(true)
	})

	describe('Whitelist Mode (listType = whitelist)', () => {
		// Block EVERYTHING unless explicitly allowed

		it('should block root by default', () => {
			const settings = createSettings([{ domain: 'example.com', paths: [], listType: 'whitelist' }])
			expect(shouldBlock('https://example.com/', settings)).toBe(true)
		})

		it('should block any path by default', () => {
			const settings = createSettings([{ domain: 'example.com', paths: [], listType: 'whitelist' }])
			expect(shouldBlock('https://example.com/feed', settings)).toBe(true)
		})

		it('should allow specific paths', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					paths: [
						{ value: '/messages', type: 'exact' },
						{ value: '/profile', type: 'exact' }
					],
					listType: 'whitelist'
				}
			])
			expect(shouldBlock('https://example.com/messages', settings)).toBe(false)
			expect(shouldBlock('https://example.com/profile', settings)).toBe(false)
			expect(shouldBlock('https://example.com/feed', settings)).toBe(true) // Not in allowed
		})

		it('should handle regex in paths', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					paths: [{ value: '^/item/\\d+$', type: 'regex' }], // Matches /item/123
					listType: 'whitelist'
				}
			])
			expect(shouldBlock('https://example.com/item/123', settings)).toBe(false)
			expect(shouldBlock('https://example.com/item/abc', settings)).toBe(true)
		})

		it('should handle glob patterns', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					paths: [{ value: '/user/*/profile', type: 'glob' }],
					listType: 'whitelist'
				}
			])
			expect(shouldBlock('https://example.com/user/123/profile', settings)).toBe(false)
			expect(shouldBlock('https://example.com/user/abc/profile', settings)).toBe(false)
			expect(shouldBlock('https://example.com/user/123/settings', settings)).toBe(true)
		})
	})

	describe('Blacklist Mode (listType = blacklist)', () => {
		// Logic: Allow everything unless explicitly blocked.

		it('should allow root path by default', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					listType: 'blacklist',
					paths: []
				}
			])
			expect(shouldBlock('https://example.com/', settings)).toBe(false)
			expect(shouldBlock('https://example.com', settings)).toBe(false)
		})

		it('should allow subpaths by default', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					listType: 'blacklist',
					paths: []
				}
			])
			expect(shouldBlock('https://example.com/feed', settings)).toBe(false)
		})

		it('should block specific paths', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					listType: 'blacklist',
					paths: [
						{ value: '/shorts', type: 'exact' },
						{ value: '/reels', type: 'exact' }
					]
				}
			])
			expect(shouldBlock('https://example.com/shorts', settings)).toBe(true)
			expect(shouldBlock('https://example.com/reels', settings)).toBe(true)
			expect(shouldBlock('https://example.com/feed', settings)).toBe(false)
		})

		it('should handle regex in paths', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					listType: 'blacklist',
					paths: [{ value: '^/video/.*', type: 'regex' }]
				}
			])
			expect(shouldBlock('https://example.com/video/123', settings)).toBe(true)
			expect(shouldBlock('https://example.com/other/123', settings)).toBe(false)
		})

		it('should handle glob patterns', () => {
			const settings = createSettings([
				{
					domain: 'example.com',
					listType: 'blacklist',
					paths: [{ value: '/shorts/*', type: 'glob' }]
				}
			])
			expect(shouldBlock('https://example.com/shorts/123', settings)).toBe(true)
			expect(shouldBlock('https://example.com/shorts/abc', settings)).toBe(true)
			expect(shouldBlock('https://example.com/videos/123', settings)).toBe(false)
		})
	})

	it('should handle invalid URLs gracefully', () => {
		const settings = createSettings([{ domain: 'example.com', paths: [], listType: 'whitelist' }])
		// Should return false (not blocked) if URL parsing fails
		expect(shouldBlock('invalid-url', settings)).toBe(false)
	})
})

function createSettings(blockedSites: SiteBlock[]): Settings {
	return {
		...DEFAULT_SETTINGS,
		blockedSites
	}
}
