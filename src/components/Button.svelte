<script lang="ts">
export let variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' = 'primary'
export let size: 'sm' | 'md' = 'md'
export let type: 'button' | 'submit' | 'reset' = 'button'
export let disabled: boolean = false
export let title: string = ''

const baseStyles =
	'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors cursor-pointer inline-flex items-center justify-center'

const variants = {
	primary:
		'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 focus:ring-slate-900 dark:focus:ring-slate-500 shadow-sm',
	secondary: 'bg-card border border-border text-foreground hover:bg-background focus:ring-slate-500',
	danger: 'text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-900/20 focus:ring-red-500',
	ghost: 'text-muted-foreground hover:text-foreground hover:bg-background focus:ring-slate-500',
	icon: 'hover:bg-background p-1 rounded-full'
}

const sizes = {
	sm: 'px-3 py-1.5 text-xs',
	md: 'px-5 py-2.5 text-sm'
}

// Special handling for icon buttons which usually have specific padding/sizing or danger variant with icon
$: classes =
	variant === 'icon' || variant === 'danger'
		? `${baseStyles} ${variants[variant]} ${$$props.class || ''}`
		: `${baseStyles} ${variants[variant]} ${sizes[size]} ${$$props.class || ''}`
</script>

<button {type} class={classes} {disabled} {title} on:click>
	<slot />
</button>
