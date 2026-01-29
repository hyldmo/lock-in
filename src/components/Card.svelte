<script lang="ts">
export let title: string = ''
</script>

<section class="bg-card rounded-2xl shadow-sm border border-border overflow-hidden {$$props.class || ''}">
	{#if $$slots.header}
		<div class="px-6 py-4 border-b border-border bg-muted/50">
			<slot name="header" />
		</div>
	{:else if title}
		<div class="px-6 py-4 border-b border-border bg-muted/50">
			<h2 class="text-lg font-semibold text-foreground">{title}</h2>
		</div>
	{/if}

	<div class="p-6 space-y-6">
		<slot />
	</div>
</section>
