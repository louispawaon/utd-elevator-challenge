import { SCENARIOS } from './scenarios.js'
import {
  renderFull,
  ensureShaftForTimeline,
} from './render.js'
import * as api from './api-client.js'




let timeline = []
let timelineIndex = 0

let playTimer = null

const shaftRoot = document.getElementById('shaft-root')
const formAdd = document.getElementById('form-add')
const inputName = document.getElementById('input-name')
const inputPickup = document.getElementById('input-pickup')
const inputDropoff = document.getElementById('input-dropoff')
const btnClearQueue = document.getElementById('btn-clear-queue')
const btnRunFifo = document.getElementById('btn-run-fifo')
const btnRunEfficient = document.getElementById('btn-run-efficient')
const btnReset = document.getElementById('btn-reset')
const chkNoon = document.getElementById('chk-noon-behavior')
const inputSpeed = document.getElementById('input-speed')
const btnPlay = document.getElementById('btn-play')
const btnPause = document.getElementById('btn-pause')
const btnStepBack = document.getElementById('btn-step-back')
const btnStepFwd = document.getElementById('btn-step-fwd')
const btnJumpEnd = document.getElementById('btn-jump-end')
const scenarioButtons = document.getElementById('scenario-buttons')

function stopPlayback() {
  if (playTimer !== null) {
    clearInterval(playTimer)
    playTimer = null
  }
}


function setTimeline(steps) {
  stopPlayback()
  timeline = steps
  timelineIndex = 0
  if (!shaftRoot || steps.length === 0) return
  ensureShaftForTimeline(shaftRoot, steps)
  paint()
}

function paint() {
  if (!shaftRoot || timeline.length === 0) return
  const snap = timeline[timelineIndex]
  const prevSnap = timelineIndex > 0 ? timeline[timelineIndex - 1] : null
  renderFull(shaftRoot, snap, timelineIndex, timeline.length, prevSnap)
}

function stepForward() {
  if (timelineIndex < timeline.length - 1) {
    timelineIndex++
    paint()
  }
}

function stepBack() {
  if (timelineIndex > 0) {
    timelineIndex--
    paint()
  }
}

function jumpEnd() {
  if (timeline.length) {
    timelineIndex = timeline.length - 1
    paint()
  }
}


async function refreshStateFromApi() {
  try {
    const [requests, riders] = await Promise.all([api.getRequests(), api.getRiders()])
    const snap = {
      currentFloor: 0,
      stops: 0,
      floorsTraversed: 0,
      requests: requests.map((r) => ({
        name: r.name,
        currentFloor: r.currentFloor,
        dropOffFloor: r.dropOffFloor,
      })),
      riders: riders.map((r) => ({
        name: r.name,
        currentFloor: r.currentFloor,
        dropOffFloor: r.dropOffFloor,
      })),
    }
    timeline = []
    timelineIndex = 0
    if (!shaftRoot) return
    ensureShaftForTimeline(shaftRoot, [snap])
    renderFull(shaftRoot, snap, 0, 1, null)
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : 'Failed to load state')
  }
}

formAdd?.addEventListener('submit', async (ev) => {
  ev.preventDefault()
  const name = String(inputName?.value || 'Guest').trim() || 'Guest'
  const pickup = Number(inputPickup?.value)
  const dropoff = Number(inputDropoff?.value)
  if (!Number.isFinite(pickup) || !Number.isFinite(dropoff) || pickup < 0 || dropoff < 0) {
    alert('Floors must be non-negative numbers.')
    return
  }
  try {
    await api.createRequest({ name, currentFloor: pickup, dropOffFloor: dropoff })
    await refreshStateFromApi()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to add request')
  }
})

btnClearQueue?.addEventListener('click', async () => {
  try {
    await api.clearAllRequests()
    await refreshStateFromApi()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to clear queue')
  }
})


async function runFromServer(mode) {
  try {
    const data = await api.simulate({
      mode,
      useLobbyClock: Boolean(chkNoon?.checked),
    })
    const steps = data?.steps
    if (!Array.isArray(steps) || steps.length === 0) {
      alert('Simulation returned no steps.')
      return
    }
    setTimeline(steps)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Simulation failed')
  }
}

btnRunFifo?.addEventListener('click', async () => {
  try {
    const requests = await api.getRequests()
    if (!requests.length) {
      alert('Add at least one request first.')
      return
    }
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to check requests')
    return
  }
  await runFromServer('fifo')
})

btnRunEfficient?.addEventListener('click', async () => {
  try {
    const requests = await api.getRequests()
    if (!requests.length) {
      alert('Add at least one request first.')
      return
    }
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to check requests')
    return
  }
  await runFromServer('efficient')
})

btnReset?.addEventListener('click', async () => {
  stopPlayback()
  timeline = []
  timelineIndex = 0
  if (shaftRoot) {
    shaftRoot.innerHTML = ''
  }
  document.getElementById('metric-floor') && (document.getElementById('metric-floor').textContent = '—')
  document.getElementById('metric-stops') && (document.getElementById('metric-stops').textContent = '—')
  document.getElementById('metric-traversed') && (document.getElementById('metric-traversed').textContent = '—')
  document.getElementById('metric-timeline') && (document.getElementById('metric-timeline').textContent = '—')
  const reqEl = document.getElementById('list-requests')
  const ridEl = document.getElementById('list-riders')
  if (reqEl) reqEl.innerHTML = ''
  if (ridEl) ridEl.innerHTML = ''
  try {
    await api.resetAll()
    await refreshStateFromApi()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Reset failed')
  }
})

chkNoon?.addEventListener('change', () => {
  
})

btnPlay?.addEventListener('click', () => {
  if (timeline.length <= 1) return
  stopPlayback()
  const ms = Math.max(50, Number(inputSpeed?.value) || 200)
  playTimer = setInterval(() => {
    if (timelineIndex >= timeline.length - 1) {
      stopPlayback()
      return
    }
    stepForward()
  }, ms)
})

btnPause?.addEventListener('click', () => {
  stopPlayback()
})

btnStepFwd?.addEventListener('click', () => {
  stopPlayback()
  stepForward()
})

btnStepBack?.addEventListener('click', () => {
  stopPlayback()
  stepBack()
})

btnJumpEnd?.addEventListener('click', () => {
  stopPlayback()
  jumpEnd()
})


async function loadScenario(scenario) {
  try {
    await api.resetAll()
    for (const p of scenario.people) {
      await api.createRequest({
        name: p.name,
        currentFloor: p.currentFloor,
        dropOffFloor: p.dropOffFloor,
      })
    }
    const data = await api.simulate({
      mode: scenario.mode === 'efficient' ? 'efficient' : 'fifo',
      useLobbyClock: Boolean(chkNoon?.checked),
    })
    const steps = data?.steps
    if (!Array.isArray(steps) || steps.length === 0) {
      alert('Simulation returned no steps.')
      return
    }
    setTimeline(steps)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Scenario failed')
  }
}

function initScenarios() {
  if (!scenarioButtons) return
  SCENARIOS.forEach((sc) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'btn'
    btn.textContent = sc.label
    btn.title = sc.id
    btn.addEventListener('click', () => loadScenario(sc))
    scenarioButtons.appendChild(btn)
  })
}

initScenarios()
refreshStateFromApi()
