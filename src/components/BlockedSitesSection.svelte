<script lang="ts">
import { slide } from 'svelte/transition'
import type { Settings, SiteBlock } from '../types/index'
import { log } from '../utils'
import Badge from './Badge.svelte'
import Button from './Button.svelte'
import Card from './Card.svelte'
import Checkbox from './Checkbox.svelte'
import Input from './Input.svelte'

export let settings: Settings
export let onSave: () => void

let newSiteInput = ''

// Track which sites have expanded settings
let expandedSites: Set<string> = new Set()

// Helpers for path inputs
let allowedPathInputs: Record<string, string> = {}
let blockedPathInputs: Record<string, string> = {}

function toggleSiteSettings(domain: string) {
	const newExpanded = new Set(expandedSites)
	if (newExpanded.has(domain)) {
		newExpanded.delete(domain)
	} else {
		newExpanded.add(domain)
	}
	expandedSites = newExpanded
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
			return
		}
	} catch (err) {
		const error = err as Error
		log.debugError(error)
		alert(error.message)
		return
	}

	settings.blockedSites = [
		...settings.blockedSites,
		{
			domain: cleanDomain,
			allowedPaths: [],
			blockedPaths: [],
			allowOnlySubpaths: false
		}
	]
	newSiteInput = ''
	onSave()
}

async function removeSite(domain: string) {
	settings.blockedSites = settings.blockedSites.filter(s => s.domain !== domain)
	onSave()

	try {
		await chrome.permissions.remove({
			origins: [`*://${domain}/*`, `*://*.${domain}/*`]
		})
	} catch (err) {
		log.debugError('Error removing permission:', err)
	}
}

function addAllowedPath(site: SiteBlock) {
	const path = allowedPathInputs[site.domain]?.trim()
	if (!path) return

	const cleanPath = path.startsWith('/') ? path : `/${path}`
	if (!site.allowedPaths.includes(cleanPath)) {
		site.allowedPaths = [...site.allowedPaths, cleanPath]
		// biome-ignore lint/correctness/noSelfAssign: Trigger reactivity in Svelte
		settings.blockedSites = settings.blockedSites
		allowedPathInputs[site.domain] = ''
		onSave()
	}
}

function removeAllowedPath(site: SiteBlock, path: string) {
	site.allowedPaths = site.allowedPaths.filter(p => p !== path)
	// biome-ignore lint/correctness/noSelfAssign: Trigger reactivity in Svelte
	settings.blockedSites = settings.blockedSites
	onSave()
}

function addBlockedPath(site: SiteBlock) {
	const path = blockedPathInputs[site.domain]?.trim()
	if (!path) return

	const cleanPath = path.startsWith('/') ? path : `/${path}`
	if (!site.blockedPaths.includes(cleanPath)) {
		site.blockedPaths = [...site.blockedPaths, cleanPath]
		// biome-ignore lint/correctness/noSelfAssign: Trigger reactivity in Svelte
		settings.blockedSites = settings.blockedSites
		blockedPathInputs[site.domain] = ''
		onSave()
	}
}

function removeBlockedPath(site: SiteBlock, path: string) {
	site.blockedPaths = site.blockedPaths.filter(p => p !== path)
	// biome-ignore lint/correctness/noSelfAssign: Trigger reactivity in Svelte
	settings.blockedSites = settings.blockedSites
	onSave()
}
</script>

<Card title="Blocked Websites">
	<div class="pb-6 border-b border-slate-100 bg-slate-50/30 mb-0!">
		<div class="flex gap-3">
			<div class="relative grow">
				<Input
					type="text"
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
			<Button on:click={addSite}>Block Site</Button>
		</div>
	</div>

	<div class="divide-y divide-slate-100">
		{#each settings.blockedSites as site (site.domain)}
			<div class="py-6 hover:bg-slate-50 transition-colors group -mx-6 px-6">
				<div class="flex justify-between items-center gap-2">
					<h3 class="text-base font-semibold text-slate-900">{site.domain}</h3>
					<div class="flex items-center gap-2 ml-auto">
						{#if expandedSites.has(site.domain)}
							<Checkbox
								bind:checked={site.allowOnlySubpaths}
								on:change={onSave}
								label="Allow only subpaths"
								class="text-xs text-slate-500 hover:text-slate-700 transition-colors mr-2"
							/>
						{/if}
						<Button
							variant="ghost"
							class="p-1!"
							on:click={() => toggleSiteSettings(site.domain)}
							title="Settings"
							>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</Button>
						<Button
							variant="danger"
							class="text-slate-400 hover:text-red-600 p-1"
							on:click={() => removeSite(site.domain)}
							title="Remove site"
							>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</Button>
					</div>
				</div>

				{#if expandedSites.has(site.domain)}
					<div class="mt-4" transition:slide={{ duration: 200 }}>

						{#if !site.allowOnlySubpaths}
							<div class="ml-0 pl-4 border-l-2 border-slate-200 space-y-3">
								<!-- Allowed Paths List -->
								{#if site.allowedPaths.length > 0}
									<div class="space-y-2">
										<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exceptions (Allowed)</div>
										<div class="flex flex-wrap gap-2">
											{#each site.allowedPaths as path}
												<Badge
													label={path}
													variant="success"
													onRemove={() => removeAllowedPath(site, path)}
												/>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Add Allowed Path -->
								<div class="flex gap-2 items-center">
									<Input
										type="text"
										placeholder="/pathname or /regex/ supported"
										bind:value={allowedPathInputs[site.domain]}
										on:keypress={(e) => e.key === 'Enter' && addAllowedPath(site)}
									/>
									<Button
										variant="secondary"
										size="sm"
										on:click={() => addAllowedPath(site)}
									>
										Add Exception
									</Button>
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
												<Badge
													label={path}
													variant="danger"
													onRemove={() => removeBlockedPath(site, path)}
												/>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Add Blocked Path -->
								<div class="flex gap-2 items-center">
									<Input
										type="text"
										placeholder="/pathname or /regex/ supported"
										bind:value={blockedPathInputs[site.domain]}
										on:keypress={(e) => e.key === 'Enter' && addBlockedPath(site)}
									/>
									<Button
										variant="secondary"
										size="sm"
										on:click={() => addBlockedPath(site)}
									>
										Add Block
									</Button>
								</div>
							</div>
						{/if}
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
</Card>
