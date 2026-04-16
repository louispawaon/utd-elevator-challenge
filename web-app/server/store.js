



const requests = new Map()
const riders = new Map()

let nextRequestId = 1
let nextRiderId = 1


function validationErrorForPersonFields(v) {
  if (!v || typeof v !== 'object') return 'Body must be a JSON object'
  const { name, currentFloor, dropOffFloor } =  (v)
  if (typeof name !== 'string' || !name.trim()) return 'name must be a non-empty string'
  if (!Number.isInteger(currentFloor) || currentFloor < 0) return 'currentFloor must be a non-negative integer'
  if (!Number.isInteger(dropOffFloor) || dropOffFloor < 0) return 'dropOffFloor must be a non-negative integer'
  return null
}

export function listRequests() {
  return [...requests.values()]
}

export function listRiders() {
  return [...riders.values()]
}


export function getRequest(id) {
  return requests.get(id) ?? null
}


export function getRider(id) {
  return riders.get(id) ?? null
}


export function createRequest(row) {
  const id = String(nextRequestId++)
  const full = { id, ...row }
  requests.set(id, full)
  return full
}


export function createRider(row) {
  const id = String(nextRiderId++)
  const full = { id, ...row }
  riders.set(id, full)
  return full
}


export function updateRequest(id, fields) {
  const cur = requests.get(id)
  if (!cur) return null
  const next = { ...cur, ...fields, id }
  requests.set(id, next)
  return next
}


export function updateRider(id, fields) {
  const cur = riders.get(id)
  if (!cur) return null
  const next = { ...cur, ...fields, id }
  riders.set(id, next)
  return next
}


export function deleteRequest(id) {
  return requests.delete(id)
}


export function deleteRider(id) {
  return riders.delete(id)
}

export function clearRequests() {
  requests.clear()
}

export function clearRiders() {
  riders.clear()
}

export function reset() {
  requests.clear()
  riders.clear()
  nextRequestId = 1
  nextRiderId = 1
}


export function syncFromSnapshot(snap) {
  requests.clear()
  riders.clear()
  nextRequestId = 1
  nextRiderId = 1
  for (const p of snap.requests) {
    createRequest({
      name: p.name,
      currentFloor: p.currentFloor,
      dropOffFloor: p.dropOffFloor,
    })
  }
  for (const p of snap.riders) {
    createRider({
      name: p.name,
      currentFloor: p.currentFloor,
      dropOffFloor: p.dropOffFloor,
    })
  }
}

export { validationErrorForPersonFields }
