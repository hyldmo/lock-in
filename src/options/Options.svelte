<script lang="ts">
import { onMount } from 'svelte'
import { DEFAULT_SETTINGS, type Settings, type SiteBlock } from '../types/index'

let settings: Settings = { ...DEFAULT_SETTINGS }
let newSiteInput = ''
let statusMessage = ''
let statusTimeout: number

// Helper for exception inputs
let exceptionInputs: Record<string, string> = {}

onMount(() => {
	chrome.storage.sync.get('settings', result => {
		settings = (result.settings as Settings) || DEFAULT_SETTINGS
	})
})

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

function toggleDay(day: number) {
	if (settings.schedule.days.includes(day)) {
		settings.schedule.days = settings.schedule.days.filter(d => d !== day)
	} else {
		settings.schedule.days = [...settings.schedule.days, day]
	}
	saveOptions()
}

function addSite() {
	const domain = newSiteInput.trim()
	if (!domain) return

	const cleanDomain = domain
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.split('/')[0]

	if (settings.blockedSites.some(s => s.domain === cleanDomain)) {
		alert('Site is already blocked')
		return
	}

	settings.blockedSites = [
		...settings.blockedSites,
		{
			domain: cleanDomain,
			pathExceptions: [],
			allowAllSubpaths: false
		}
	]
	newSiteInput = ''
	saveOptions()
}

function removeSite(domain: string) {
	settings.blockedSites = settings.blockedSites.filter(s => s.domain !== domain)
	saveOptions()
}

function addException(site: SiteBlock) {
	const path = exceptionInputs[site.domain]?.trim()
	if (!path) return

	const cleanPath = path.startsWith('/') ? path : `/${path}`
	if (!site.pathExceptions.includes(cleanPath)) {
		site.pathExceptions = [...site.pathExceptions, cleanPath]
		settings.blockedSites = settings.blockedSites // Trigger reactivity
		exceptionInputs[site.domain] = ''
		saveOptions()
	}
}

function removeException(site: SiteBlock, path: string) {
	site.pathExceptions = site.pathExceptions.filter(p => p !== path)
	settings.blockedSites = settings.blockedSites // Trigger reactivity
	saveOptions()
}
</script>

<div class="container mx-auto max-w-[600px] p-5">
	<h1 class="text-center text-[#1d1d1f] text-2xl mb-5 font-semibold">Lock In Settings</h1>

	<section class="bg-white rounded-lg p-5 mb-5 shadow-sm">
		<h2 class="mt-0 text-xl border-b border-gray-200 pb-2.5 mb-4">Schedule</h2>
		<div class="mb-4">
			<span class="block font-medium mb-1">Active Days:</span>
			<div class="flex gap-2.5 flex-wrap mt-1.5">
				{#each [
					{ val: 1, label: 'Mon' },
					{ val: 2, label: 'Tue' },
					{ val: 3, label: 'Wed' },
					{ val: 4, label: 'Thu' },
					{ val: 5, label: 'Fri' },
					{ val: 6, label: 'Sat' },
					{ val: 0, label: 'Sun' }
				] as day}
					<label class="cursor-pointer select-none flex items-center gap-1">
						<input
							type="checkbox"
							class="accent-blue-500"
							checked={settings.schedule.days.includes(day.val)}
							on:change={() => toggleDay(day.val)}
						/>
						{day.label}
					</label>
				{/each}
			</div>
		</div>
		<div class="flex gap-5">
			<label class="flex flex-col">
				<span class="font-medium mb-1">Start Time:</span>
				<input type="time" class="border border-gray-300 rounded px-2 py-1" bind:value={settings.schedule.startTime} on:change={saveOptions} />
			</label>
			<label class="flex flex-col">
				<span class="font-medium mb-1">End Time:</span>
				<input type="time" class="border border-gray-300 rounded px-2 py-1" bind:value={settings.schedule.endTime} on:change={saveOptions} />
			</label>
		</div>
	</section>

	<section class="bg-white rounded-lg p-5 mb-5 shadow-sm">
		<h2 class="mt-0 text-xl border-b border-gray-200 pb-2.5 mb-4">Blocked Websites</h2>
		<div class="flex gap-2.5 mb-4">
			<input
				type="text"
				class="grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="e.g. facebook.com"
				list="commonSites"
				bind:value={newSiteInput}
				on:keypress={(e) => e.key === 'Enter' && addSite()}
			/>
			<datalist id="commonSites">
				<option value="facebook.com"></option>
				<option value="twitter.com"></option>
				<option value="instagram.com"></option>
				<option value="youtube.com"></option>
				<option value="reddit.com"></option>
				<option value="linkedin.com"></option>
				<option value="tiktok.com"></option>
				<option value="netflix.com"></option>
			</datalist>

			<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" on:click={addSite}>Block Site</button>
		</div>
		<div class="flex flex-col gap-2.5">
			{#each settings.blockedSites as site (site.domain)}
				<div class="border border-gray-200 rounded p-2.5 bg-gray-50">
					<div class="flex justify-between items-center mb-2">
						<span class="font-bold">{site.domain}</span>
						<div class="flex items-center gap-2.5">
							<label class="text-sm cursor-pointer select-none flex items-center gap-1">
								<input
									type="checkbox"
									class="accent-blue-500"
									bind:checked={site.allowAllSubpaths}
									on:change={saveOptions}
								/>
								Allow all subpaths
							</label>
							<button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-sm rounded transition-colors" on:click={() => removeSite(site.domain)}>Remove</button>
						</div>
					</div>

					<div class="ml-5 text-sm">
						{#if site.pathExceptions.length > 0}
							<div class="text-xs mb-1.5 font-medium text-gray-500">Allowed Subpaths:</div>
						{/if}

						{#each site.pathExceptions as path}
							<div class="flex justify-between items-center mb-1 text-gray-600">
								<span>{path}</span>
								<button
									class="bg-red-500 hover:bg-red-600 text-white px-1.5 py-0.5 text-xs rounded transition-colors"
									on:click={() => removeException(site, path)}>x</button
								>
							</div>
						{/each}
					</div>

					<div class="mt-2 flex gap-1.5">
						<input
							type="text"
							class="flex-grow p-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
							placeholder="/path/to/allow"
							bind:value={exceptionInputs[site.domain]}
							on:keypress={(e) => e.key === 'Enter' && addException(site)}
						/>
						<button class="text-sm px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors" on:click={() => addException(site)}>Allow Path</button>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="bg-white rounded-lg p-5 mb-5 shadow-sm">
		<h2 class="mt-0 text-xl border-b border-gray-200 pb-2.5 mb-4">Settings</h2>
		<div class="mb-4">
			<label class="flex items-center gap-2 cursor-pointer select-none">
				<input type="checkbox" class="accent-blue-500" bind:checked={settings.flashEnabled} on:change={saveOptions} />
				Enable Flashing "Lock In" Screen
			</label>
		</div>
	</section>

	<div class="text-center text-green-600 h-5">{statusMessage}</div>
</div>
