<script lang="ts">
import { onMount } from 'svelte'
import { fly } from 'svelte/transition'
import { DEFAULT_SETTINGS, type Settings, type SiteBlock } from '../types/index'

let settings: Settings = { ...DEFAULT_SETTINGS }
let newSiteInput = ''
let statusMessage = ''
let statusTimeout: number

// Helper for allowed path inputs
let allowedPathInputs: Record<string, string> = {}
// Helper for blocked path inputs
let blockedPathInputs: Record<string, string> = {}

onMount(() => {
	chrome.storage.sync.get('settings', result => {
		settings = (result.settings as Settings) || DEFAULT_SETTINGS
		// Initialize blockedPaths for existing sites that don't have it
		settings.blockedSites = settings.blockedSites.map(site => ({
			...site,
			allowedPaths: site.allowedPaths || [],
			blockedPaths: site.blockedPaths || []
		}))
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

async function addSite() {
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

	// Request permission for the site
	try {
		const granted = await chrome.permissions.request({
			origins: [`*://${cleanDomain}/*`, `*://*.${cleanDomain}/*`]
		})

		if (!granted) {
			// If permission denied, don't add the site
			return
		}
	} catch (err) {
		const error = err as Error
		console.error(error)
		alert(error.message)
		return
	}

	settings.blockedSites = [
		...settings.blockedSites,
		{
			domain: cleanDomain,
			allowedPaths: [],
			blockedPaths: [],
			allowAllSubpaths: false
		}
	]
	newSiteInput = ''
	saveOptions()
}

async function removeSite(domain: string) {
	settings.blockedSites = settings.blockedSites.filter(s => s.domain !== domain)
	saveOptions()

	// Clean up permissions
	try {
		await chrome.permissions.remove({
			origins: [`*://${domain}/*`, `*://*.${domain}/*`]
		})
	} catch (err) {
		console.error('Error removing permission:', err)
	}
}

function addAllowedPath(site: SiteBlock) {
	const path = allowedPathInputs[site.domain]?.trim()
	if (!path) return

	const cleanPath = path.startsWith('/') ? path : `/${path}`
	if (!site.allowedPaths.includes(cleanPath)) {
		site.allowedPaths = [...site.allowedPaths, cleanPath]
		settings.blockedSites = settings.blockedSites // Trigger reactivity
		allowedPathInputs[site.domain] = ''
		saveOptions()
	}
}

function removeAllowedPath(site: SiteBlock, path: string) {
	site.allowedPaths = site.allowedPaths.filter(p => p !== path)
	settings.blockedSites = settings.blockedSites // Trigger reactivity
	saveOptions()
}

function addBlockedPath(site: SiteBlock) {
	const path = blockedPathInputs[site.domain]?.trim()
	if (!path) return

	const cleanPath = path.startsWith('/') ? path : `/${path}`
	if (!site.blockedPaths.includes(cleanPath)) {
		site.blockedPaths = [...site.blockedPaths, cleanPath]
		settings.blockedSites = settings.blockedSites // Trigger reactivity
		blockedPathInputs[site.domain] = ''
		saveOptions()
	}
}

function removeBlockedPath(site: SiteBlock, path: string) {
	site.blockedPaths = site.blockedPaths.filter(p => p !== path)
	settings.blockedSites = settings.blockedSites // Trigger reactivity
	saveOptions()
}
</script>

<div class="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
	<header class="mb-8 text-center">
		<h1 class="text-3xl font-bold text-slate-900 tracking-tight">Lock In</h1>
		<p class="mt-2 text-slate-600">Manage your blocked sites and schedule.</p>
	</header>

	<!-- Schedule Section -->
	<section class="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
		<div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
			<h2 class="text-lg font-semibold text-slate-800">Schedule</h2>
		</div>

		<div class="p-6 space-y-6">
			<div>
				<span class="block text-sm font-medium text-slate-700 mb-3">Active Days</span>
				<div class="flex flex-wrap gap-2">
					{#each [
						{ val: 1, label: 'Mon' },
						{ val: 2, label: 'Tue' },
						{ val: 3, label: 'Wed' },
						{ val: 4, label: 'Thu' },
						{ val: 5, label: 'Fri' },
						{ val: 6, label: 'Sat' },
						{ val: 0, label: 'Sun' }
					] as day}
						<label class="cursor-pointer relative">
							<input
								type="checkbox"
								class="peer sr-only"
								checked={settings.schedule.days.includes(day.val)}
								on:change={() => toggleDay(day.val)}
							/>
							<div class="px-3 py-1.5 rounded-full text-sm font-medium transition-all
								bg-slate-50 text-slate-600 border border-slate-200
								hover:border-blue-400
								peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
								peer-focus:ring-2 peer-focus:ring-blue-200">
								{day.label}
							</div>
						</label>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div class="space-y-1">
					<span class="block text-sm font-medium text-slate-700">Time Range</span>
					<div class="flex items-center gap-2">
						<input
							type="time"
							class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed p-2 border"
							bind:value={settings.schedule.startTime}
							on:change={saveOptions}
							disabled={settings.schedule.allDay}
						/>
						<span class="text-slate-400">to</span>
						<input
							type="time"
							class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed p-2 border"
							bind:value={settings.schedule.endTime}
							on:change={saveOptions}
							disabled={settings.schedule.allDay}
						/>
					</div>
				</div>

				<div class="flex items-center h-full pt-6">
					<label class="inline-flex items-center cursor-pointer group">
						<input
							type="checkbox"
							class="sr-only peer"
							bind:checked={settings.schedule.allDay}
							on:change={saveOptions}
						/>
						<div class="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						<span class="ms-3 text-sm font-medium text-slate-700 group-hover:text-slate-900">All Day</span>
					</label>
				</div>
			</div>
		</div>
	</section>

	<!-- Blocked Websites Section -->
	<section class="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
		<div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
			<h2 class="text-lg font-semibold text-slate-800">Blocked Websites</h2>
		</div>

		<div class="p-6 border-b border-slate-100 bg-slate-50/30">
			<div class="flex gap-3">
				<div class="relative grow">
					<input
						type="text"
						class="block w-full pl-4 pr-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-shadow"
						placeholder="example.com"
						list="commonSites"
						bind:value={newSiteInput}
						on:keypress={(e) => e.key === 'Enter' && addSite()}
					/>
					<datalist id="commonSites">
						<option value="facebook.com"></option>
						<option value="x.com"></option>
						<option value="instagram.com"></option>
						<option value="youtube.com"></option>
						<option value="reddit.com"></option>
						<option value="linkedin.com"></option>
						<option value="tiktok.com"></option>
						<option value="netflix.com"></option>
					</datalist>
				</div>
				<button
					class="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors shadow-sm cursor-pointer"
					on:click={addSite}
				>
					Block Site
				</button>
			</div>
		</div>

		<div class="divide-y divide-slate-100">
			{#each settings.blockedSites as site (site.domain)}
				<div class="p-6 hover:bg-slate-50 transition-colors group">
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="text-base font-semibold text-slate-900">{site.domain}</h3>
							<label class="mt-1 inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-500 hover:text-slate-700 transition-colors">
								<input
									type="checkbox"
									class="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
									bind:checked={site.allowAllSubpaths}
									on:change={saveOptions}
								/>
								Allow all subpaths
							</label>
						</div>
						<button
							class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
							on:click={() => removeSite(site.domain)}
							title="Remove site"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>

					{#if !site.allowAllSubpaths}
						<div class="ml-0 pl-4 border-l-2 border-slate-200 space-y-3">
							<!-- Allowed Paths List -->
							{#if site.allowedPaths.length > 0}
								<div class="space-y-2">
									<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exceptions (Allowed)</div>
									<div class="flex flex-wrap gap-2">
										{#each site.allowedPaths as path}
											<div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-100 text-xs font-medium">
												<span>{path}</span>
												<button
													class="hover:text-green-900 hover:bg-green-200 rounded-full p-0.5 transition-colors cursor-pointer"
													on:click={() => removeAllowedPath(site, path)}
												>×</button>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Add Allowed Path -->
							<div class="flex gap-2 items-center">
								<input
									type="text"
									class="grow px-3 py-1.5 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
									placeholder="/allow/this/path"
									bind:value={allowedPathInputs[site.domain]}
									on:keypress={(e) => e.key === 'Enter' && addAllowedPath(site)}
								/>
								<button
									class="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 transition-colors cursor-pointer"
									on:click={() => addAllowedPath(site)}
								>
									Add Exception
								</button>
							</div>
						</div>
					{:else}
						<div class="ml-0 pl-4 border-l-2 border-slate-200 space-y-3">
							<!-- Blocked Paths List -->
							{#if site.blockedPaths.length > 0}
								<div class="space-y-2">
									<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specific Blocks</div>
									<div class="flex flex-wrap gap-2">
										{#each site.blockedPaths as path}
											<div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 text-xs font-medium">
												<span>{path}</span>
												<button
													class="hover:text-red-900 hover:bg-red-200 rounded-full p-0.5 transition-colors cursor-pointer"
													on:click={() => removeBlockedPath(site, path)}
												>×</button>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Add Blocked Path -->
							<div class="flex gap-2 items-center">
								<input
									type="text"
									class="grow px-3 py-1.5 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
									placeholder="/block/only/this"
									bind:value={blockedPathInputs[site.domain]}
									on:keypress={(e) => e.key === 'Enter' && addBlockedPath(site)}
								/>
								<button
									class="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 transition-colors cursor-pointer"
									on:click={() => addBlockedPath(site)}
								>
									Add Block
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
			{#if settings.blockedSites.length === 0}
				<div class="p-8 text-center text-slate-500 text-sm">
					No sites blocked yet. Add one above to get started.
				</div>
			{/if}
		</div>
	</section>

	<!-- Settings Section -->
	<section class="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
		<div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
			<h2 class="text-lg font-semibold text-slate-800">General Settings</h2>
		</div>
		<div class="p-6">
			<label class="flex items-center gap-3 cursor-pointer group">
				<input
					type="checkbox"
					class="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 transition duration-150 ease-in-out"
					bind:checked={settings.flashEnabled}
					on:change={saveOptions}
				/>
				<span class="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">Enable Flashing "Lock In" Screen</span>
			</label>
			<p class="mt-2 ml-8 text-sm text-slate-500">
				Shows a visual effect when a blocked site is accessed during focus hours.
			</p>
		</div>
	</section>

	<!-- Toast Notification -->
	{#if statusMessage}
		<div transition:fly={{ y: 20, duration: 300 }} class="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
			</svg>
			{statusMessage}
		</div>
	{/if}
</div>
