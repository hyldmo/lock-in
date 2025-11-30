<script lang="ts">
export let checked: boolean = false
export let label: string = ''
</script>

<label class="inline-flex items-center cursor-pointer group {$$props.class || ''}">
  <input
    type="checkbox"
    class="sr-only peer"
    bind:checked
    on:change
  />
  <div class="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  {#if label}
    <span class="ms-3 text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
  {/if}
</label>
