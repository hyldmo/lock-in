<script lang="ts">
export let label: string
export let onRemove: () => void
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

<div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors {variants[variant]} {$$props.class || ''}">
  <span>{label}</span>
  <button
    class="rounded-full p-0.5 transition-colors cursor-pointer {buttonVariants[variant]}"
    on:click|stopPropagation={onRemove}
    title="Remove"
  >×</button>
</div>
