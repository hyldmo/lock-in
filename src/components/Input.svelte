<script lang="ts">
export let value: string | number
export let placeholder: string = ''
export let type: 'text' | 'time' | 'number' | 'email' | 'password' = 'text'
export let list: string | undefined = undefined
export let disabled: boolean = false

const baseStyles =
	'block w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed'
const padding = type === 'time' ? 'p-2' : 'px-4 py-2.5'
const textSize = type === 'time' ? 'sm:text-sm' : 'sm:text-sm'

$: classes = `${baseStyles} ${padding} ${textSize} ${$$props.class || ''}`
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
/>
