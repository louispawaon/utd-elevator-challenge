





let carEl = null


export function floorToBottomPercent(f, maxFloor) {
  if (maxFloor <= 0) return 50
  return (f / maxFloor) * 100
}


export function computeMaxFloor(floors, minTop = 10) {
  const m = Math.max(0, ...floors, minTop)
  return m
}


export function ensureShaft(container, maxFloor) {
  container.innerHTML = ''
  container.dataset.maxFloor = String(maxFloor)

  const scene = document.createElement('div')
  scene.className = 'shaft-scene'

  const ruler = document.createElement('div')
  ruler.className = 'shaft-ruler shaft-travel'
  ruler.setAttribute('aria-hidden', 'true')

  const hoistway = document.createElement('div')
  hoistway.className = 'hoistway shaft-travel'

  const channel = document.createElement('div')
  channel.className = 'hoistway-channel'

  carEl = document.createElement('div')
  carEl.className = 'elevator-car'
  carEl.setAttribute('aria-label', 'Elevator car')

  const copStrip = document.createElement('div')
  copStrip.className = 'cab-cop-strip'

  const copRow = document.createElement('div')
  copRow.className = 'cab-cop-row'

  const floorDisplay = document.createElement('div')
  floorDisplay.className = 'cab-floor-display'
  floorDisplay.setAttribute('aria-live', 'polite')
  floorDisplay.setAttribute('aria-atomic', 'true')
  floorDisplay.textContent = '00'

  const lantern = document.createElement('div')
  lantern.className = 'cab-direction-lantern'
  lantern.setAttribute('aria-label', 'Idle')
  lantern.textContent = '\u00B7'

  copRow.appendChild(floorDisplay)
  copRow.appendChild(lantern)
  copStrip.appendChild(copRow)

  const doorFrame = document.createElement('div')
  doorFrame.className = 'cab-door-frame'

  const doorLeft = document.createElement('div')
  doorLeft.className = 'elevator-door elevator-door--left'
  doorLeft.setAttribute('aria-hidden', 'true')

  const doorRight = document.createElement('div')
  doorRight.className = 'elevator-door elevator-door--right'
  doorRight.setAttribute('aria-hidden', 'true')

  doorFrame.appendChild(doorLeft)
  doorFrame.appendChild(doorRight)

  const cabInterior = document.createElement('div')
  cabInterior.className = 'elevator-cab-interior'

  carEl.appendChild(copStrip)
  carEl.appendChild(doorFrame)
  carEl.appendChild(cabInterior)

  channel.appendChild(carEl)
  hoistway.appendChild(channel)

  const landing = document.createElement('div')
  landing.className = 'landing-lane shaft-travel'

  for (let f = maxFloor; f >= 0; f--) {
    const pct = floorToBottomPercent(f, maxFloor)

    const tick = document.createElement('div')
    tick.className = 'floor-tick'
    tick.dataset.floor = String(f)
    tick.style.bottom = `${pct}%`
    const label = document.createElement('span')
    label.className = 'floor-tick-label'
    label.textContent = `F${f}`
    tick.appendChild(label)
    ruler.appendChild(tick)

    const slot = document.createElement('div')
    slot.className = 'landing-slot'
    slot.dataset.floor = String(f)

    const hall = document.createElement('div')
    hall.className = 'landing-hall'

    const badge = document.createElement('div')
    badge.className = 'landing-floor-badge'
    badge.textContent = `F${f}`

    const call = document.createElement('div')
    call.className = 'landing-call'
    call.setAttribute('aria-hidden', 'true')
    const callUp = document.createElement('span')
    callUp.className = 'landing-call-btn landing-call-btn--up'
    callUp.textContent = '\u25B2'
    const callDown = document.createElement('span')
    callDown.className = 'landing-call-btn landing-call-btn--down'
    callDown.textContent = '\u25BC'
    call.appendChild(callUp)
    call.appendChild(callDown)

    const chips = document.createElement('div')
    chips.className = 'landing-chips'
    chips.dataset.role = 'landing-chips'

    hall.appendChild(badge)
    hall.appendChild(call)
    hall.appendChild(chips)
    slot.appendChild(hall)
    slot.style.bottom = `${pct}%`
    landing.appendChild(slot)
  }

  scene.appendChild(ruler)
  scene.appendChild(hoistway)
  scene.appendChild(landing)
  container.appendChild(scene)
}


function allFloorsFromSnapshot(snap) {
  const out = [snap.currentFloor]
  for (const p of snap.requests) {
    out.push(p.currentFloor, p.dropOffFloor)
  }
  for (const p of snap.riders) {
    out.push(p.currentFloor, p.dropOffFloor)
  }
  return out
}


export function ensureShaftForSnapshot(container, snap) {
  const maxFloor = computeMaxFloor(allFloorsFromSnapshot(snap))
  ensureShaft(container, maxFloor)
  return maxFloor
}


export function maxFloorFromSteps(steps) {
  if (!steps.length) return 10
  let m = 10
  for (const s of steps) {
    const floors = allFloorsFromSnapshot(s)
    if (floors.length) m = Math.max(m, ...floors)
  }
  return m
}


export function ensureShaftForTimeline(container, steps) {
  ensureShaft(container, maxFloorFromSteps(steps))
}


function directionFromSnapshots(snap, prevSnap) {
  if (!prevSnap) return 'idle'
  const d = snap.currentFloor - prevSnap.currentFloor
  if (d > 0) return 'up'
  if (d < 0) return 'down'
  return 'idle'
}


export function renderShaftState(container, snap, prevSnap = null) {
  const maxFloor = Number(container.dataset.maxFloor)
  if (!Number.isFinite(maxFloor) || !carEl) return

  
  const floorDisplay = carEl.querySelector('.cab-floor-display')
  if (floorDisplay) {
    const f = snap.currentFloor
    const shown = f >= 0 && f <= 99 ? String(f).padStart(2, '0') : String(f)
    floorDisplay.textContent = shown
  }

  const direction = directionFromSnapshots(snap, prevSnap)
  carEl.dataset.direction = direction

  const lantern = carEl.querySelector('.cab-direction-lantern')
  if (lantern) {
    lantern.textContent = direction === 'up' ? '\u25B2' : direction === 'down' ? '\u25BC' : '\u00B7'
    lantern.setAttribute(
      'aria-label',
      direction === 'up' ? 'Moving up' : direction === 'down' ? 'Moving down' : 'Idle',
    )
  }

  const doorsOpen = Boolean(prevSnap && snap.stops > prevSnap.stops)
  const doorLeft = carEl.querySelector('.elevator-door--left')
  const doorRight = carEl.querySelector('.elevator-door--right')
  doorLeft?.classList.toggle('elevator-door--open', doorsOpen)
  doorRight?.classList.toggle('elevator-door--open', doorsOpen)

  const pct = floorToBottomPercent(snap.currentFloor, maxFloor)
  carEl.style.bottom = `${pct}%`

  
  const waitingByFloor = new Map()
  for (const p of snap.requests) {
    const list = waitingByFloor.get(p.currentFloor) || []
    list.push(p)
    waitingByFloor.set(p.currentFloor, list)
  }

  const cabInterior = carEl.querySelector('.elevator-cab-interior')
  if (cabInterior) {
    cabInterior.innerHTML = ''
    for (const p of snap.riders) {
      cabInterior.appendChild(personChip(p, 'riding'))
    }
  }

  const slots = container.querySelectorAll('.landing-slot')
  const current = snap.currentFloor
  slots.forEach((slot) => {
    const f = Number(slot.dataset.floor)
    slot.classList.toggle('landing-slot--active', f === current)
    const chips = slot.querySelector('[data-role="landing-chips"]')
    if (!chips) return
    chips.innerHTML = ''
    const waiting = waitingByFloor.get(f) || []
    for (const p of waiting) {
      chips.appendChild(personChip(p, 'waiting'))
    }
  })
}


function personChip(p, kind) {
  const span = document.createElement('span')
  span.className = `person-chip ${kind}`
  span.textContent = `${p.name} → ${p.dropOffFloor}`
  span.title = `${p.name}: pickup ${p.currentFloor}, drop ${p.dropOffFloor}`
  return span
}


export function renderMetrics(snap, index, total) {
  const floorEl = document.getElementById('metric-floor')
  const stopsEl = document.getElementById('metric-stops')
  const travEl = document.getElementById('metric-traversed')
  const timeEl = document.getElementById('metric-timeline')
  if (floorEl) floorEl.textContent = String(snap.currentFloor)
  if (stopsEl) stopsEl.textContent = String(snap.stops)
  if (travEl) travEl.textContent = String(snap.floorsTraversed)
  if (timeEl) timeEl.textContent = `${index + 1} / ${total}`
}


export function renderQueues(snap) {
  const reqEl = document.getElementById('list-requests')
  const ridEl = document.getElementById('list-riders')
  if (reqEl) {
    reqEl.innerHTML = ''
    snap.requests.forEach((p) => {
      const li = document.createElement('li')
      li.textContent = `${p.name}: wait at ${p.currentFloor} → drop ${p.dropOffFloor}`
      reqEl.appendChild(li)
    })
    if (!snap.requests.length) {
      const li = document.createElement('li')
      li.textContent = '(none)'
      li.style.color = 'var(--muted)'
      reqEl.appendChild(li)
    }
  }
  if (ridEl) {
    ridEl.innerHTML = ''
    snap.riders.forEach((p) => {
      const li = document.createElement('li')
      li.textContent = `${p.name}: to floor ${p.dropOffFloor}`
      ridEl.appendChild(li)
    })
    if (!snap.riders.length) {
      const li = document.createElement('li')
      li.textContent = '(none)'
      li.style.color = 'var(--muted)'
      ridEl.appendChild(li)
    }
  }
}


export function renderFull(shaftRoot, snap, stepIndex, stepCount, prevSnap = null) {
  renderShaftState(shaftRoot, snap, prevSnap)
  renderMetrics(snap, stepIndex, stepCount)
  renderQueues(snap)
}
