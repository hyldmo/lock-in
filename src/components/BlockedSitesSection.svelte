<script lang="ts">
import { slide } from 'svelte/transition'
import type { PathRule, Settings, SiteBlock } from '../types/index'
import { log } from '../utils'
import Badge from './Badge.svelte'
import Button from './Button.svelte'
import Card from './Card.svelte'
import Input from './Input.svelte'
import Toggle from './Toggle.svelte'

export let settings: Settings
export let onSave: () => void

let newSiteInput = ''

// Track which sites have expanded settings
let expandedSites: Set<string> = new Set()

// Sort blocked sites alphabetically by domain
$: sortedBlockedSites = [...settings.blockedSites].sort((a, b) => a.domain.localeCompare(b.domain))

// Helpers for path inputs
let pathInputs: Record<string, string> = {}

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
			paths: [],
			listType: 'whitelist'
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

function addPath(site: SiteBlock) {
	const input = pathInputs[site.domain]?.trim()
	if (!input) return

	let rule: PathRule

	// Regex detection (legacy support + explicit regex entry)
	if (input.startsWith('/') && input.endsWith('/') && input.length > 2) {
		rule = { value: input.slice(1, -1), type: 'regex' }
	}
	// Glob detection (contains wildcard)
	else if (input.includes('*') || input.includes('?')) {
		rule = { value: input, type: 'glob' }
	}
	// Exact match
	else {
		const cleanPath = input.startsWith('/') ? input : `/${input}`
		rule = { value: cleanPath, type: 'exact' }
	}

	// Initialize paths if undefined
	if (!site.paths) site.paths = []

	// Check for duplicates
	if (!site.paths.some(r => r.value === rule.value && r.type === rule.type)) {
		site.paths = [...site.paths, rule]
		// biome-ignore lint/correctness/noSelfAssign: Trigger reactivity in Svelte
		settings.blockedSites = settings.blockedSites
		pathInputs[site.domain] = ''
		onSave()
	}
}

function removePath(site: SiteBlock, rule: PathRule) {
	site.paths = site.paths.filter(r => r !== rule)
	// biome-ignore lint/correctness/noSelfAssign: Trigger reactivity in Svelte
	settings.blockedSites = settings.blockedSites
	onSave()
}

function toggleListType(site: SiteBlock) {
	site.listType = site.listType === 'whitelist' ? 'blacklist' : 'whitelist'
	// biome-ignore lint/correctness/noSelfAssign: Trigger reactivity in Svelte
	settings.blockedSites = settings.blockedSites
	onSave()
}

function getRuleLabel(rule: PathRule): string {
	if (rule.type === 'regex') return `/${rule.value}/`
	return rule.value
}

function getRuleBadgeVariant(site: SiteBlock): 'danger' | 'success' | 'neutral' {
	return site.listType === 'blacklist' ? 'danger' : 'success'
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
		{#each sortedBlockedSites as site (site.domain)}
			<div class="py-6 hover:bg-slate-50 transition-colors group -mx-6 px-6">
				<div class="flex justify-between items-center gap-2">
					<div class="flex items-center gap-3 flex-1 min-w-0">
						<h3 class="text-base font-semibold text-slate-900">{site.domain}</h3>
						{#if !expandedSites.has(site.domain)}
                            {@const rules = site.paths || []}
                            {@const previewRules = rules.slice(0, 4)}
							{#if previewRules.length > 0}
								<div class="flex flex-wrap items-center gap-1.5">
									{#each previewRules as rule}
										<Badge
											label={getRuleLabel(rule)}
											variant={getRuleBadgeVariant(site)}
											class="text-xs"
										/>
									{/each}
									{#if rules.length > 4}
										<span class="text-xs text-slate-400 px-1.5 py-0.5">
											+{rules.length - 4} more
										</span>
									{/if}
								</div>
							{/if}
						{/if}
					</div>
					<div class="flex items-center gap-2 ml-auto">
						{#if expandedSites.has(site.domain)}
							<div class="mr-4 flex items-center gap-2">
								<span class="text-xs text-slate-500 font-medium">
									{site.listType === 'whitelist' ? 'Whitelist Mode' : 'Blacklist Mode'}
								</span>
								<Toggle
									checked={site.listType === 'blacklist'}
									on:change={() => toggleListType(site)}
								/>
							</div>
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
                    {@const rules = site.paths || []}
					<div class="mt-4" transition:slide={{ duration: 200 }}>
						<div class="ml-0 pl-4 border-l-2 border-slate-200 space-y-3">
							<div class="text-xs text-slate-500 mb-2">
								{#if site.listType === 'whitelist'}
									Blocks <strong>everything</strong> on {site.domain} except the paths below.
								{:else}
									Allows <strong>everything</strong> on {site.domain} except the paths below.
								{/if}
							</div>

							<!-- Paths List -->
							{#if rules.length > 0}
								<div class="space-y-2">
									<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
										{site.listType === 'whitelist' ? 'Exceptions (Allowed)' : 'Blocked Paths'}
									</div>
									<div class="flex flex-wrap gap-2">
										{#each rules as rule}
											<Badge
												label={getRuleLabel(rule)}
												variant={getRuleBadgeVariant(site)}
                                                onRemove={() => removePath(site, rule)}
											>
                                                <!-- Add icon for type -->
                                                <svelte:fragment slot="prefix">
                                                    {#if rule.type === 'glob'}
                                                        <span class="mr-1 text-slate-500" title="Wildcard Pattern">
                                                            *
                                                        </span>
                                                    {:else if rule.type === 'regex'}
                                                        <span class="mr-1 text-slate-500" title="Regular Expression">
                                                            .*
                                                        </span>
                                                    {/if}
                                                </svelte:fragment>
                                            </Badge>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Add Path -->
							<div class="flex gap-2 items-center">
								<Input
									type="text"
									placeholder="/pathname, /regex/, or glob*"
									bind:value={pathInputs[site.domain]}
									on:keypress={(e) => e.key === 'Enter' && addPath(site)}
								/>
								<Button
									variant="secondary"
									size="sm"
									on:click={() => addPath(site)}
								>
									{site.listType === 'whitelist' ? 'Add Exception' : 'Add Block'}
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
		{#if sortedBlockedSites.length === 0}
			<div class="p-8 text-center text-slate-500 text-sm">
				No sites blocked yet. Add one above to get started.
			</div>
		{/if}
	</div>
</Card>
