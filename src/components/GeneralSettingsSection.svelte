<script lang="ts">
import { migrateSettings, type Settings } from '../types/index'
import { domainMatchPatterns, log } from '../utils'
import Card from './Card.svelte'
import Checkbox from './Checkbox.svelte'
import Input from './Input.svelte'

export let settings: Settings
export let onSave: () => void
// biome-ignore lint/suspicious/noEmptyBlockStatements: noop default
export let onStatus: (msg: string) => void = () => {}

function setTheme(theme: 'light' | 'dark' | 'system') {
	settings.theme = theme
	onSave()
}

async function syncPermissions() {
	const domains = settings.blockedSites.map(s => s.domain)
	if (domains.length === 0) return

	const origins = domains.flatMap(domainMatchPatterns)
	try {
		const granted = await chrome.permissions.request({ origins })
		if (granted) {
			onStatus('Permissions synced')
		} else {
			onStatus('Permissions denied')
		}
	} catch (err) {
		log.debugError('Failed to sync permissions:', err)
		onStatus('Failed to sync permissions')
	}
}

function exportSettings() {
	const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = 'lock-in-settings.json'
	a.click()
	URL.revokeObjectURL(url)
}

function importSettings() {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = '.json'
	input.onchange = async () => {
		const file = input.files?.[0]
		if (!file) return
		try {
			const text = await file.text()
			const imported = migrateSettings(JSON.parse(text) as Settings)
			settings = imported
			onSave()
			await syncPermissions()
		} catch {
			alert('Invalid settings file')
		}
	}
	input.click()
}
</script>

<Card title="General Settings">
	<div class="space-y-6">
		<div class="space-y-2">
			<label class="block text-sm font-medium text-text-primary mb-1">Theme</label>
			<p class="text-sm text-text-secondary mb-3">Choose your preferred color theme</p>
			<div class="flex gap-2">
				<button
					type="button"
					on:click={() => setTheme('light')}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
						{settings.theme === 'light'
							? 'bg-blue-600 text-white'
							: 'bg-card border border-border text-foreground hover:bg-background'}"
				>
					Light
				</button>
				<button
					type="button"
					on:click={() => setTheme('dark')}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
						{settings.theme === 'dark'
							? 'bg-blue-600 text-white'
							: 'bg-card border border-border text-foreground hover:bg-background'}"
				>
					Dark
				</button>
				<button
					type="button"
					on:click={() => setTheme('system')}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
						{settings.theme === 'system'
							? 'bg-blue-600 text-white'
							: 'bg-card border border-border text-foreground hover:bg-background'}"
				>
					System
				</button>
			</div>
		</div>

		<div>
			<Checkbox
				bind:checked={settings.flashEnabled}
				on:change={onSave}
				label='Enable Flashing "Lock In" Screen'
				class="font-medium"
			/>
			<p class="ml-[1.35rem] text-sm text-text-secondary">
				Shows a visual effect when a blocked site is accessed during focus hours
			</p>
		</div>

		<div class="space-y-2">
			<label for="customMessage" class="block text-sm font-medium text-text-primary mb-1">
				Custom Block Message
			</label>
			<p class="text-sm text-text-secondary">Text to display when a site is blocked</p>
			<Input
				id="customMessage"
				bind:value={settings.customBlockMessage}
				on:input={onSave}
				placeholder="YOU NEED TO LOCK IN"
			/>
		</div>

		<div class="space-y-2">
			<label class="block text-sm font-medium text-text-primary mb-1">Import / Export</label>
			<p class="text-sm text-text-secondary">Back up or restore your settings</p>
			<div class="flex gap-2">
				<button
					type="button"
					on:click={exportSettings}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-card border border-border text-foreground hover:bg-background"
				>
					Export
				</button>
				<button
					type="button"
					on:click={importSettings}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-card border border-border text-foreground hover:bg-background"
				>
					Import
				</button>
				<button
					type="button"
					on:click={syncPermissions}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-card border border-border text-foreground hover:bg-background"
					title="Re-request host permissions for all blocked sites"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</Card>
