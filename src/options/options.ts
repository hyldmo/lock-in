import { DEFAULT_SETTINGS, type Schedule, type Settings } from '../types/index'

// State
let currentSettings: Settings = { ...DEFAULT_SETTINGS }

// Elements
const startTimeInput = document.getElementById('startTime') as HTMLInputElement
const endTimeInput = document.getElementById('endTime') as HTMLInputElement
const dayCheckboxes = document.querySelectorAll('.day-check') as NodeListOf<HTMLInputElement>
const newSiteInput = document.getElementById('newSiteInput') as HTMLInputElement
const _addSiteBtn = document.getElementById('addSiteBtn') as HTMLButtonElement
const sitesList = document.getElementById('sitesList') as HTMLDivElement
const flashToggle = document.getElementById('flashToggle') as HTMLInputElement
const statusEl = document.getElementById('status') as HTMLDivElement

// Initialization
document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('addSiteBtn')?.addEventListener('click', addSite)
document.getElementById('flashToggle')?.addEventListener('change', saveOptions)
document.getElementById('startTime')?.addEventListener('change', saveOptions)
document.getElementById('endTime')?.addEventListener('change', saveOptions)
dayCheckboxes.forEach(cb => cb.addEventListener('change', saveOptions))

function restoreOptions() {
	chrome.storage.sync.get('settings', result => {
		const settings = (result.settings as Settings) || DEFAULT_SETTINGS
		currentSettings = settings

		// Schedule
		startTimeInput.value = settings.schedule.startTime
		endTimeInput.value = settings.schedule.endTime
		dayCheckboxes.forEach(cb => {
			cb.checked = settings.schedule.days.includes(Number.parseInt(cb.value, 10))
		})

		// Flash
		flashToggle.checked = settings.flashEnabled

		// Sites
		renderSitesList()
	})
}

function saveOptions() {
	const schedule: Schedule = {
		startTime: startTimeInput.value,
		endTime: endTimeInput.value,
		days: Array.from(dayCheckboxes)
			.filter(cb => cb.checked)
			.map(cb => Number.parseInt(cb.value, 10))
	}

	const newSettings: Settings = {
		...currentSettings,
		schedule,
		flashEnabled: flashToggle.checked
	}

	currentSettings = newSettings

	chrome.storage.sync.set({ settings: newSettings }, () => {
		showStatus('Settings saved')
	})
}

function showStatus(msg: string) {
	statusEl.textContent = msg
	setTimeout(() => {
		statusEl.textContent = ''
	}, 2000)
}

function addSite() {
	const domain = newSiteInput.value.trim()
	if (!domain) return

	// Basic validation/cleanup
	const cleanDomain = domain
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.split('/')[0]

	if (currentSettings.blockedSites.some(s => s.domain === cleanDomain)) {
		alert('Site is already blocked')
		return
	}

	currentSettings.blockedSites.push({
		domain: cleanDomain,
		pathExceptions: []
	})

	newSiteInput.value = ''
	renderSitesList()
	saveOptions()
}

function removeSite(domain: string) {
	currentSettings.blockedSites = currentSettings.blockedSites.filter(s => s.domain !== domain)
	renderSitesList()
	saveOptions()
}

function addException(domain: string, path: string) {
	if (!path) return

	// Ensure path starts with /
	const cleanPath = path.startsWith('/') ? path : `/${path}`

	const site = currentSettings.blockedSites.find(s => s.domain === domain)
	if (site && !site.pathExceptions.includes(cleanPath)) {
		site.pathExceptions.push(cleanPath)
		renderSitesList()
		saveOptions()
	}
}

function removeException(domain: string, path: string) {
	const site = currentSettings.blockedSites.find(s => s.domain === domain)
	if (site) {
		site.pathExceptions = site.pathExceptions.filter(p => p !== path)
		renderSitesList()
		saveOptions()
	}
}

function renderSitesList() {
	sitesList.innerHTML = ''

	currentSettings.blockedSites.forEach(site => {
		const siteEl = document.createElement('div')
		siteEl.className = 'site-item'

		// Header (Domain + Remove)
		const header = document.createElement('div')
		header.className = 'site-header'

		const domainSpan = document.createElement('span')
		domainSpan.className = 'site-domain'
		domainSpan.textContent = site.domain

		const removeBtn = document.createElement('button')
		removeBtn.className = 'destructive'
		removeBtn.textContent = 'Remove'
		removeBtn.onclick = () => removeSite(site.domain)

		header.appendChild(domainSpan)
		header.appendChild(removeBtn)
		siteEl.appendChild(header)

		// Exceptions List
		const exceptionsList = document.createElement('div')
		exceptionsList.className = 'exceptions-list'

		if (site.pathExceptions.length > 0) {
			const title = document.createElement('div')
			title.textContent = 'Allowed Subpaths:'
			title.style.fontSize = '0.85em'
			title.style.marginBottom = '5px'
			exceptionsList.appendChild(title)
		}

		site.pathExceptions.forEach(path => {
			const exItem = document.createElement('div')
			exItem.className = 'exception-item'

			const pathSpan = document.createElement('span')
			pathSpan.textContent = path

			const delBtn = document.createElement('button')
			delBtn.className = 'destructive'
			delBtn.style.padding = '2px 6px'
			delBtn.style.fontSize = '0.8em'
			delBtn.textContent = 'x'
			delBtn.onclick = () => removeException(site.domain, path)

			exItem.appendChild(pathSpan)
			exItem.appendChild(delBtn)
			exceptionsList.appendChild(exItem)
		})

		siteEl.appendChild(exceptionsList)

		// Add Exception Form
		const addExForm = document.createElement('div')
		addExForm.className = 'add-exception-form'

		const exInput = document.createElement('input')
		exInput.placeholder = '/path/to/allow'
		exInput.type = 'text'

		const addExBtn = document.createElement('button')
		addExBtn.textContent = 'Allow Path'
		addExBtn.style.fontSize = '0.9em'
		addExBtn.onclick = () => addException(site.domain, exInput.value)

		addExForm.appendChild(exInput)
		addExForm.appendChild(addExBtn)
		siteEl.appendChild(addExForm)

		sitesList.appendChild(siteEl)
	})
}
