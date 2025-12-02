<script lang="ts">
import type { Settings, SiteBlock } from '../types/index'
import Badge from './Badge.svelte'
import Button from './Button.svelte'
import Card from './Card.svelte'
import Checkbox from './Checkbox.svelte'
import Input from './Input.svelte'

export let settings: Settings
export let onSave: () => void

let newSiteInput = ''

// Helpers for path inputs
let allowedPathInputs: Record<string, string> = {}
let blockedPathInputs: Record<string, string> = {}

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
		console.error('Error removing permission:', err)
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
				<div class="flex justify-between items-baseline gap-2 mb-4">
					<h3 class="text-base font-semibold text-slate-900">{site.domain}</h3>
					<Checkbox
						bind:checked={site.allowOnlySubpaths}
						on:change={onSave}
						label="Allow only subpaths"
						class="text-xs text-slate-500 hover:text-slate-700 transition-colors"
					/>
					<Button
						variant="danger"
						class="text-slate-400 hover:text-red-600 p-1 ml-auto"
						on:click={() => removeSite(site.domain)}
						title="Remove site"
						>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</Button>
				</div>

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
								class="grow px-3 py-1.5 text-sm"
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
								class="grow px-3 py-1.5 text-sm"
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
		{/each}
		{#if settings.blockedSites.length === 0}
			<div class="p-8 text-center text-slate-500 text-sm">
				No sites blocked yet. Add one above to get started.
			</div>
		{/if}
	</div>
</Card>
