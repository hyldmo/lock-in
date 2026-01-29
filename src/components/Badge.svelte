<script lang="ts">
export let label: string
export let onRemove: (() => void) | undefined = undefined
export let variant: 'success' | 'danger' | 'neutral' = 'neutral'

const variants = {
	success:
		'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40',
	danger: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40',
	neutral: 'bg-background text-foreground border-border hover:bg-card'
}

const buttonVariants = {
	success: 'hover:text-green-900 dark:hover:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
	danger: 'hover:text-red-900 dark:hover:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
	neutral: 'hover:text-foreground hover:bg-card'
}
</script>

<div
	class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors {variants[variant]} {$$props.class || ''}"
>
	<slot name="prefix" />
	<span>{label}</span>
	{#if onRemove}
		<button
			class="rounded-full p-0.5 transition-colors cursor-pointer {buttonVariants[variant]}"
			on:click|stopPropagation={onRemove}
			title="Remove"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	{/if}
</div>
