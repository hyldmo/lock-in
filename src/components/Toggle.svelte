<script lang="ts">
export let checked: boolean = false
export let label: string = ''
</script>

<label class="inline-flex items-center cursor-pointer group {$$props.class || ''}">
	<input type="checkbox" class="sr-only peer" bind:checked on:change />
	<div
		class="relative w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"
	></div>
	{#if label}
		<span
			class="ms-3 text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100"
		>
			{label}
		</span>
	{/if}
</label>
