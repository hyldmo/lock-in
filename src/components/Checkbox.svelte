<script lang="ts">
export let checked: boolean = false
export let label: string = ''
</script>

<label class="inline-flex items-center cursor-pointer group select-none {$$props.class || ''}">
	<input
		type="checkbox"
		class="rounded border-border text-blue-600 shadow-sm focus:ring focus:ring-blue-200 focus:ring-opacity-50"
		bind:checked
		on:change
	/>
	{#if label}
		<span class="ml-2 text-sm text-muted-foreground group-hover:text-foreground">{label}</span>
	{/if}
</label>
