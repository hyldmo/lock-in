<script lang="ts">
import { onMount } from 'svelte'
import { fly } from 'svelte/transition'
import BlockedSitesSection from '../components/BlockedSitesSection.svelte'
import GeneralSettingsSection from '../components/GeneralSettingsSection.svelte'
import ScheduleSection from '../components/ScheduleSection.svelte'
import { DEFAULT_SETTINGS, migrateSettings, type Settings } from '../types/index'
import { applyTheme, watchSystemTheme } from '../utils/theme'

let settings: Settings = { ...DEFAULT_SETTINGS }
let statusMessage = ''
let statusTimeout: number
let systemThemeUnwatch: (() => void) | undefined

onMount(() => {
	chrome.storage.sync.get('settings', result => {
		settings = migrateSettings(result.settings as Settings)
		applyTheme(settings.theme)

		// Watch for system theme changes if theme is set to 'system'
		if (settings.theme === 'system') {
			systemThemeUnwatch = watchSystemTheme(() => {
				applyTheme('system')
			})
		}
	})

	// Listen for settings changes from other tabs/windows
	chrome.storage.onChanged.addListener(changes => {
		if (changes.settings) {
			const newSettings = migrateSettings(changes.settings.newValue as Settings)
			settings = newSettings
			applyTheme(newSettings.theme)

			// Update system theme watcher
			if (systemThemeUnwatch) {
				systemThemeUnwatch()
				systemThemeUnwatch = undefined
			}

			if (newSettings.theme === 'system') {
				systemThemeUnwatch = watchSystemTheme(() => {
					applyTheme('system')
				})
			}
		}
	})

	return () => {
		if (systemThemeUnwatch) {
			systemThemeUnwatch()
		}
	}
})

$: if (settings.theme) {
	applyTheme(settings.theme)

	// Update system theme watcher when theme changes
	if (systemThemeUnwatch) {
		systemThemeUnwatch()
		systemThemeUnwatch = undefined
	}

	if (settings.theme === 'system') {
		systemThemeUnwatch = watchSystemTheme(() => {
			applyTheme('system')
		})
	}
}

function saveOptions() {
	chrome.storage.sync.set({ settings }, () => {
		showStatus('Settings saved')
	})
}

function showStatus(msg: string) {
	statusMessage = msg
	clearTimeout(statusTimeout)
	statusTimeout = window.setTimeout(() => {
		statusMessage = ''
	}, 2000)
}
</script>

<div class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
	<header class="mb-8 text-center flex items-baseline gap-2">
		<h1 class="text-3xl font-bold text-text-primary tracking-tight">Lock In</h1>
		<h2 class="text-lg font-medium text-text-secondary tracking-tight">Settings</h2>
		<p class="ml-2 text-text-secondary">Manage your blocked sites and schedule.</p>
	</header>

	<div class="grid grid-cols-1 lg:grid-cols-[1fr_30rem] gap-8 items-start relative">
		<div class="lg:col-start-1">
			<BlockedSitesSection bind:settings onSave={saveOptions} />
		</div>

		<div class="lg:col-start-2 sticky top-8 space-y-8">
			<ScheduleSection bind:settings onSave={saveOptions} />
			<GeneralSettingsSection bind:settings onSave={saveOptions} onStatus={showStatus} />
		</div>
	</div>

	<!-- Toast Notification -->
	{#if statusMessage}
		<div
			transition:fly={{ y: 20, duration: 300 }}
			class="fixed bottom-6 right-6 bg-slate-800 dark:bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-green-400"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					clip-rule="evenodd"
				/>
			</svg>
			{statusMessage}
		</div>
	{/if}
</div>
