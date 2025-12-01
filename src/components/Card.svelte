<script lang="ts">
export let title: string = ''
</script>

<section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden {$$props.class || ''}">
  {#if title}
    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h2 class="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
  {/if}

  <div class="p-6 space-y-6">
    <slot />
  </div>
</section>
