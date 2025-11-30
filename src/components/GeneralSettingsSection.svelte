<script lang="ts">
import type { Settings } from '../types/index'
import Card from './Card.svelte'
import Checkbox from './Checkbox.svelte'

export let settings: Settings
export let onSave: () => void
</script>

<Card title="General Settings">
  <div>
    <Checkbox
      bind:checked={settings.flashEnabled}
      on:change={onSave}
      label='Enable Flashing "Lock In" Screen'
      class="font-medium"
    />
    <p class="mt-2 ml-6 text-sm text-slate-500">
      Shows a visual effect when a blocked site is accessed during focus hours.
    </p>
  </div>
</Card>
