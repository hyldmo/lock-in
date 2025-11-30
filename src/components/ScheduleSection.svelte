<script lang="ts">
import type { Settings } from '../types/index'
import Card from './Card.svelte'
import Input from './Input.svelte'
import Toggle from './Toggle.svelte'

export let settings: Settings
export let onSave: () => void

function toggleDay(day: number) {
	if (settings.schedule.days.includes(day)) {
		settings.schedule.days = settings.schedule.days.filter(d => d !== day)
	} else {
		settings.schedule.days = [...settings.schedule.days, day]
	}
	onSave()
}

const days = [
	{ val: 1, label: 'Mon' },
	{ val: 2, label: 'Tue' },
	{ val: 3, label: 'Wed' },
	{ val: 4, label: 'Thu' },
	{ val: 5, label: 'Fri' },
	{ val: 6, label: 'Sat' },
	{ val: 0, label: 'Sun' }
]
</script>

<Card title="Schedule">
  <div>
    <span class="block text-sm font-medium text-slate-700 mb-3">Active Days</span>
    <div class="flex flex-wrap gap-2">
      {#each days as day}
        <label class="cursor-pointer relative">
          <input
            type="checkbox"
            class="peer sr-only"
            checked={settings.schedule.days.includes(day.val)}
            on:change={() => toggleDay(day.val)}
          />
          <div class="px-3 py-1.5 rounded-full text-sm font-medium transition-all
            bg-slate-50 text-slate-600 border border-slate-200
            hover:border-blue-400
            peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
            peer-focus:ring-2 peer-focus:ring-blue-200">
            {day.label}
          </div>
        </label>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div class="space-y-1">
      <span class="block text-sm font-medium text-slate-700">Time Range</span>
      <div class="flex items-center gap-2">
        <Input
          type="time"
          bind:value={settings.schedule.startTime}
          on:change={onSave}
          disabled={settings.schedule.allDay}
        />
        <span class="text-slate-400">to</span>
        <Input
          type="time"
          bind:value={settings.schedule.endTime}
          on:change={onSave}
          disabled={settings.schedule.allDay}
        />
      </div>
    </div>

    <div class="flex items-center h-full pt-6">
      <Toggle
        bind:checked={settings.schedule.allDay}
        on:change={onSave}
        label="All Day"
      />
    </div>
  </div>
</Card>
