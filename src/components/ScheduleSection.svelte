<script lang="ts">
import type { Schedule, Settings } from '../types/index'
import Button from './Button.svelte'
import Card from './Card.svelte'
import Input from './Input.svelte'
import Toggle from './Toggle.svelte'

export let settings: Settings
export let onSave: () => void

function toggleDay(schedule: Schedule, day: number) {
	if (schedule.days.includes(day)) {
		schedule.days = schedule.days.filter(d => d !== day)
	} else {
		schedule.days = [...schedule.days, day]
	}
	onSave()
}

function addSchedule() {
	settings.schedules = [
		...settings.schedules,
		{
			startTime: '09:00',
			endTime: '17:00',
			days: [1, 2, 3, 4, 5],
			allDay: false
		}
	]
	onSave()
}

function removeSchedule(index: number) {
	settings.schedules = settings.schedules.filter((_, i) => i !== index)
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

<Card>
	<div slot="header" class="flex items-center justify-between">
		<h2 class="text-lg font-semibold text-slate-800">Schedule{settings.schedules.length > 1 ? 's' : ''}</h2>
		<button
			type="button"
			on:click={addSchedule}
			class="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
			title="Add schedule"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>

	<div class="space-y-6">
		{#each settings.schedules as schedule, index}
			<div class="space-y-4 {index > 0 ? 'pt-3 border-t border-slate-200' : ''}">
				<h3 class="flex items-center justify-between text-sm font-medium text-slate-700 mb-3">
					Active Days
					{#if index > 0}
						<button
							type="button"
							on:click={() => removeSchedule(index)}
							class="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600"
							title="Remove schedule"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					{/if}
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each days as day}
						<label class="cursor-pointer relative">
							<input
								type="checkbox"
								class="peer sr-only"
								checked={schedule.days.includes(day.val)}
								on:change={() => toggleDay(schedule, day.val)}
							/>
							<div
								class="px-3 py-1.5 rounded-full text-sm font-medium transition-all
									bg-slate-50 text-slate-600 border border-slate-200
									hover:border-blue-400
									peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
									peer-focus:ring-2 peer-focus:ring-blue-200"
							>
								{day.label}
							</div>
						</label>
					{/each}
				</div>

				<div class="flex gap-6 items-end">
					<div class="space-y-1">
						<span class="block text-sm font-medium text-slate-700">Time Range</span>
						<div class="flex items-center gap-2">
							<Input
								type="time"
								bind:value={schedule.startTime}
								on:change={onSave}
								disabled={schedule.allDay}
							/>
							<span class="text-slate-400">to</span>
							<Input
								type="time"
								bind:value={schedule.endTime}
								on:change={onSave}
								disabled={schedule.allDay}
							/>
						</div>
					</div>

					<div class="flex items-center h-full pb-2">
						<Toggle bind:checked={schedule.allDay} on:change={onSave} label="All Day" />
					</div>
				</div>
			</div>
		{/each}
	</div>
</Card>
