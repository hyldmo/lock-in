<script lang="ts">
import type { Settings } from '../types/index'
import Card from './Card.svelte'
import Checkbox from './Checkbox.svelte'
import Input from './Input.svelte'

export let settings: Settings
export let onSave: () => void
</script>

<Card title="General Settings">
	<div class="space-y-6">
		<div>
			<Checkbox
				bind:checked={settings.flashEnabled}
				on:change={onSave}
				label='Enable Flashing "Lock In" Screen'
				class="font-medium"
			/>
			<p class="ml-[1.35rem] text-sm text-slate-500">
				Shows a visual effect when a blocked site is accessed during focus hours.
			</p>
		</div>

		<div class="space-y-2">
			<label for="customMessage" class="block text-sm font-medium text-slate-700 mb-1">
				Custom Block Message
			</label>
			<p class="text-sm text-slate-500">
				Text to display when a site is blocked.
			</p>
			<Input
				id="customMessage"
				bind:value={settings.customBlockMessage}
				on:input={onSave}
				placeholder="YOU NEED TO LOCK IN"
			/>
		</div>
	</div>
</Card>
