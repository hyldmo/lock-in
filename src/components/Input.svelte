<script lang="ts">
export let value: string | number
export let placeholder: string = ''
export let type: 'text' | 'time' | 'number' | 'email' | 'password' = 'text'
export let list: string | undefined = undefined
export let disabled: boolean = false
export let className: string = ''

const baseStyles =
	'block w-full border border-border rounded-lg shadow-sm bg-card text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-background disabled:text-muted-foreground disabled:cursor-not-allowed'
const padding = type === 'time' ? 'p-2' : 'px-4 py-2.5'
const textSize = type === 'time' ? 'sm:text-sm' : 'sm:text-sm'

$: classes = `${baseStyles} ${padding} ${textSize} ${className}`
</script>

<input
	{type}
	class={classes}
	{placeholder}
	{list}
	{disabled}
	bind:value
	on:change
	on:input
	on:keypress
	{...$$restProps}
/>
