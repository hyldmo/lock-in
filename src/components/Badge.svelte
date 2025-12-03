<script lang="ts">
export let label: string
export let onRemove: (() => void) | undefined = undefined
export let variant: 'success' | 'danger' | 'neutral' = 'neutral'

const variants = {
	success: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100',
	danger: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100',
	neutral: 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
}

const buttonVariants = {
	success: 'hover:text-green-900 hover:bg-green-200',
	danger: 'hover:text-red-900 hover:bg-red-200',
	neutral: 'hover:text-slate-900 hover:bg-slate-200'
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
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
	</button>
    {/if}
</div>
