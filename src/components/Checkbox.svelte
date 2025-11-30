<script lang="ts">
export let checked: boolean = false
export let label: string = ''
</script>

<label class="inline-flex items-center cursor-pointer group select-none {$$props.class || ''}">
  <input
    type="checkbox"
    class="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
    bind:checked
    on:change
  />
  {#if label}
    <span class="ml-2 text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
  {/if}
</label>
